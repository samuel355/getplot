const { database, logger, errors } = require('@getplot/shared');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const config = require('../config');
const PDFService = require('./pdf.service');

const { NotFoundError, ValidationError, ConflictError } = errors;

class TransactionsService {
  /**
   * Reserve a plot with deposit
   */
  async reservePlot({ propertyId, location, depositAmount, paymentMethod, customerDetails, userId }) {
    try {
      // 1. Get property details
      const propertyResponse = await axios.get(
        `${config.services.properties}/api/v1/properties/${propertyId}?location=${location}`
      );
      const property = propertyResponse.data.data;

      // 2. Check if property is available
      if (property.status !== 'available') {
        throw new ConflictError('Property is not available for reservation');
      }

      // 3. Calculate amounts
      const totalAmount = property.price;
      const minimumDeposit = totalAmount * (config.business.minimumDepositPercentage / 100);
      
      if (depositAmount < minimumDeposit) {
        throw new ValidationError(`Minimum deposit is ${minimumDeposit} ${config.business.currency}`);
      }

      const remainingAmount = totalAmount - depositAmount;

      // 4. Create transaction
      const transaction = await database.transaction(async (client) => {
        // Insert transaction
        const txnResult = await client.query(
          `INSERT INTO transactions.transactions (
            user_id, property_id, location, type, status,
            total_amount, deposit_amount, paid_amount, remaining_amount,
            payment_method, customer_details
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *`,
          [
            userId || null,
            propertyId,
            location,
            'reservation',
            'pending',
            totalAmount,
            depositAmount,
            0,
            totalAmount,
            paymentMethod,
            JSON.stringify(customerDetails),
          ]
        );

        const txn = txnResult.rows[0];

        // Update property status
        await axios.put(
          `${config.services.properties}/api/v1/properties/${propertyId}/status`,
          {
            location,
            status: 'reserved',
            customerData: {
              firstName: customerDetails.firstName,
              lastName: customerDetails.lastName,
              email: customerDetails.email,
              phone: customerDetails.phone,
              country: customerDetails.country,
              residentialAddress: customerDetails.residentialAddress,
            },
          }
        );

        return txn;
      });

      // 5. Generate invoice PDF
      const invoiceData = {
        transactionId: transaction.id,
        type: 'reservation',
        property: {
          plotNo: property.plotNo,
          streetName: property.streetName,
          location: property.location,
          area: property.area,
        },
        customer: customerDetails,
        amounts: {
          total: totalAmount,
          deposit: depositAmount,
          remaining: remainingAmount,
        },
        accounts: config.accounts,
      };

      const pdfBuffer = await PDFService.generateInvoice(invoiceData);

      // 6. Send notifications (email + SMS)
      try {
        await axios.post(`${config.services.notifications}/api/v1/notifications/email`, {
          to: customerDetails.email,
          template: 'plot_reservation',
          data: {
            firstName: customerDetails.firstName,
            plotNo: property.plotNo,
            location: property.location,
            amount: totalAmount.toLocaleString(),
            deposit: depositAmount.toLocaleString(),
          },
          attachments: [
            {
              filename: 'invoice.pdf',
              content: pdfBuffer.toString('base64'),
            },
          ],
        });

        await axios.post(`${config.services.notifications}/api/v1/notifications/sms`, {
          to: customerDetails.phone,
          message: `Your reservation for plot ${property.plotNo} at ${property.location} has been confirmed. Amount: ${config.business.currency} ${totalAmount.toLocaleString()}. Check your email for details.`,
        });
      } catch (notifError) {
        logger.error('Notification error:', notifError);
        // Don't fail the transaction if notifications fail
      }

      logger.info('Plot reserved', { transactionId: transaction.id, propertyId });

      return {
        transaction: this._formatTransaction(transaction),
        property: {
          plotNo: property.plotNo,
          location: property.location,
        },
        paymentInstructions: config.accounts,
        invoicePdf: pdfBuffer,
      };
    } catch (error) {
      logger.error('Reserve plot error:', error);
      throw error;
    }
  }

  /**
   * Buy a plot (full payment)
   */
  async buyPlot({ propertyId, location, amount, paymentMethod, customerDetails, userId }) {
    try {
      // 1. Get property details
      const propertyResponse = await axios.get(
        `${config.services.properties}/api/v1/properties/${propertyId}?location=${location}`
      );
      const property = propertyResponse.data.data;

      // 2. Check if property is available
      if (property.status !== 'available') {
        throw new ConflictError('Property is not available for purchase');
      }

      // 3. Validate amount
      if (amount !== property.price) {
        throw new ValidationError('Invalid payment amount');
      }

      // 4. Create transaction
      const transaction = await database.transaction(async (client) => {
        const txnResult = await client.query(
          `INSERT INTO transactions.transactions (
            user_id, property_id, location, type, status,
            total_amount, paid_amount, remaining_amount,
            payment_method, customer_details
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          RETURNING *`,
          [
            userId || null,
            propertyId,
            location,
            'purchase',
            'pending',
            amount,
            0,
            amount,
            paymentMethod,
            JSON.stringify(customerDetails),
          ]
        );

        const txn = txnResult.rows[0];

        // Update property status to hold
        await axios.put(
          `${config.services.properties}/api/v1/properties/${propertyId}/status`,
          {
            location,
            status: 'hold',
            customerData: {
              firstName: customerDetails.firstName,
              lastName: customerDetails.lastName,
              email: customerDetails.email,
              phone: customerDetails.phone,
              country: customerDetails.country,
              residentialAddress: customerDetails.residentialAddress,
            },
          }
        );

        return txn;
      });

      // 5. Generate invoice
      const invoiceData = {
        transactionId: transaction.id,
        type: 'purchase',
        property: {
          plotNo: property.plotNo,
          streetName: property.streetName,
          location: property.location,
          area: property.area,
        },
        customer: customerDetails,
        amounts: {
          total: amount,
          paid: 0,
          remaining: amount,
        },
        accounts: config.accounts,
      };

      const pdfBuffer = await PDFService.generateInvoice(invoiceData);

      // 6. Send notifications
      try {
        await axios.post(`${config.services.notifications}/api/v1/notifications/email`, {
          to: customerDetails.email,
          template: 'plot_purchase',
          data: {
            firstName: customerDetails.firstName,
            plotNo: property.plotNo,
            location: property.location,
            amount: amount.toLocaleString(),
          },
          attachments: [
            {
              filename: 'invoice.pdf',
              content: pdfBuffer.toString('base64'),
            },
          ],
        });

        await axios.post(`${config.services.notifications}/api/v1/notifications/sms`, {
          to: customerDetails.phone,
          message: `Your purchase request for plot ${property.plotNo} at ${property.location} has been received. Amount: ${config.business.currency} ${amount.toLocaleString()}. Check your email for payment details.`,
        });
      } catch (notifError) {
        logger.error('Notification error:', notifError);
      }

      logger.info('Plot purchase initiated', { transactionId: transaction.id, propertyId });

      return {
        transaction: this._formatTransaction(transaction),
        property: {
          plotNo: property.plotNo,
          location: property.location,
        },
        paymentInstructions: config.accounts,
        invoicePdf: pdfBuffer,
      };
    } catch (error) {
      logger.error('Buy plot error:', error);
      throw error;
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(transactionId, paymentProof) {
    try {
      const result = await database.query(
        'SELECT * FROM transactions.transactions WHERE id = $1',
        [transactionId]
      );

      if (result.rows.length === 0) {
        throw new NotFoundError('Transaction');
      }

      const transaction = result.rows[0];

      // Update transaction as completed
      await database.query(
        `UPDATE transactions.transactions 
         SET status = $1, paid_amount = $2, remaining_amount = 0, completed_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        ['completed', transaction.total_amount, transactionId]
      );

      // Update property status to sold
      await axios.put(
        `${config.services.properties}/api/v1/properties/${transaction.property_id}/status`,
        {
          location: transaction.location,
          status: 'sold',
        }
      );

      logger.info('Payment verified', { transactionId });

      return { success: true, message: 'Payment verified successfully' };
    } catch (error) {
      logger.error('Verify payment error:', error);
      throw error;
    }
  }

  /**
   * Get user transactions
   */
  async getUserTransactions(userId, { page = 1, limit = 20, status, type }) {
    try {
      let query = 'SELECT * FROM transactions.transactions WHERE user_id = $1';
      const params = [userId];
      let paramCount = 1;

      if (status) {
        paramCount++;
        query += ` AND status = $${paramCount}`;
        params.push(status);
      }

      if (type) {
        paramCount++;
        query += ` AND type = $${paramCount}`;
        params.push(type);
      }

      query += ' ORDER BY created_at DESC';

      // Count total
      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
      const countResult = await database.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count, 10);

      // Add pagination
      const offset = (page - 1) * limit;
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(limit);

      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push(offset);

      const result = await database.query(query, params);

      return {
        transactions: result.rows.map(this._formatTransaction),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      };
    } catch (error) {
      logger.error('Get user transactions error:', error);
      throw error;
    }
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id, userId = null) {
    try {
      let query = 'SELECT * FROM transactions.transactions WHERE id = $1';
      const params = [id];

      if (userId) {
        query += ' AND user_id = $2';
        params.push(userId);
      }

      const result = await database.query(query, params);

      if (result.rows.length === 0) {
        throw new NotFoundError('Transaction');
      }

      return this._formatTransaction(result.rows[0]);
    } catch (error) {
      logger.error('Get transaction error:', error);
      throw error;
    }
  }

  /**
   * Private: Format transaction
   */
  _formatTransaction(row) {
    return {
      id: row.id,
      userId: row.user_id,
      propertyId: row.property_id,
      location: row.location,
      type: row.type,
      status: row.status,
      totalAmount: parseFloat(row.total_amount),
      depositAmount: parseFloat(row.deposit_amount) || null,
      paidAmount: parseFloat(row.paid_amount),
      remainingAmount: parseFloat(row.remaining_amount),
      paymentMethod: row.payment_method,
      customerDetails: row.customer_details,
      createdAt: row.created_at,
      completedAt: row.completed_at,
    };
  }
}

module.exports = new TransactionsService();

