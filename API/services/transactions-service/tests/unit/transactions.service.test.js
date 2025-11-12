const TransactionsService = require('../../../src/services/transactions.service');
const { errors } = require('@getplot/shared');

const { ValidationError, ConflictError } = errors;

describe('TransactionsService - Unit Tests', () => {
  describe('reservePlot', () => {
    it('should validate required parameters', async () => {
      await expect(
        TransactionsService.reservePlot({})
      ).rejects.toThrow();
    });

    it('should validate deposit amount', async () => {
      const mockProperty = {
        data: {
          id: 'test-id',
          price: 100000,
          status: 'available'
        }
      };

      // Mock axios
      const axios = require('axios');
      axios.get = jest.fn().mockResolvedValue({ data: mockProperty });

      await expect(
        TransactionsService.reservePlot({
          propertyId: 'test-id',
          location: 'yabi',
          depositAmount: 0, // Invalid: too low
          paymentMethod: 'card',
          customerDetails: {},
          userId: 'user-id'
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should reject reservation for unavailable property', async () => {
      const mockProperty = {
        data: {
          id: 'test-id',
          price: 100000,
          status: 'sold' // Not available
        }
      };

      const axios = require('axios');
      axios.get = jest.fn().mockResolvedValue({ data: mockProperty });

      await expect(
        TransactionsService.reservePlot({
          propertyId: 'test-id',
          location: 'yabi',
          depositAmount: 50000,
          paymentMethod: 'card',
          customerDetails: {},
          userId: 'user-id'
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('buyPlot', () => {
    it('should validate required parameters', async () => {
      await expect(
        TransactionsService.buyPlot({})
      ).rejects.toThrow();
    });

    it('should require full payment amount', async () => {
      const mockProperty = {
        data: {
          id: 'test-id',
          price: 100000,
          status: 'available'
        }
      };

      const axios = require('axios');
      axios.get = jest.fn().mockResolvedValue({ data: mockProperty });

      await expect(
        TransactionsService.buyPlot({
          propertyId: 'test-id',
          location: 'yabi',
          paymentAmount: 50000, // Less than full amount
          paymentMethod: 'card',
          customerDetails: {},
          userId: 'user-id'
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getUserTransactions', () => {
    it('should require userId', async () => {
      await expect(
        TransactionsService.getUserTransactions(null)
      ).rejects.toThrow();
    });

    it('should handle pagination', async () => {
      const { database } = require('@getplot/shared');
      database.query = jest.fn().mockResolvedValue({ 
        rows: [],
        rowCount: 0 
      });

      const result = await TransactionsService.getUserTransactions('user-id', {
        page: 1,
        limit: 10
      });

      expect(result).toBeDefined();
      expect(result.transactions).toBeDefined();
    });
  });
});

