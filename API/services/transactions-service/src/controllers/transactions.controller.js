const { asyncHandler, ResponseHandler } = require('@getplot/shared');
const transactionsService = require('../services/transactions.service');

class TransactionsController {
  /**
   * @route   POST /api/v1/transactions/reserve
   * @desc    Reserve a plot
   * @access  Private
   */
  reservePlot = asyncHandler(async (req, res) => {
    const userId = req.user?.sub;
    const data = {
      ...req.body,
      userId,
    };

    const result = await transactionsService.reservePlot(data);

    return ResponseHandler.created(res, {
      transaction: result.transaction,
      property: result.property,
      paymentInstructions: result.paymentInstructions,
    }, 'Plot reserved successfully. Check your email for payment instructions.');
  });

  /**
   * @route   POST /api/v1/transactions/buy
   * @desc    Buy a plot
   * @access  Private
   */
  buyPlot = asyncHandler(async (req, res) => {
    const userId = req.user?.sub;
    const data = {
      ...req.body,
      userId,
    };

    const result = await transactionsService.buyPlot(data);

    return ResponseHandler.created(res, {
      transaction: result.transaction,
      property: result.property,
      paymentInstructions: result.paymentInstructions,
    }, 'Purchase request submitted successfully. Check your email for payment instructions.');
  });

  /**
   * @route   POST /api/v1/transactions/:id/verify
   * @desc    Verify payment
   * @access  Private/Admin
   */
  verifyPayment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { paymentProof } = req.body;

    const result = await transactionsService.verifyPayment(id, paymentProof);

    return ResponseHandler.success(res, result, 'Payment verified successfully');
  });

  /**
   * @route   GET /api/v1/transactions/user/:userId
   * @desc    Get user transactions
   * @access  Private
   */
  getUserTransactions = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const filters = {
      page: req.query.page ? parseInt(req.query.page, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit, 10) : 20,
      status: req.query.status,
      type: req.query.type,
    };

    // Users can only view their own transactions unless admin
    if (req.user.sub !== userId && !['admin', 'system_admin'].includes(req.user.role)) {
      return ResponseHandler.forbidden(res, 'Cannot access other user transactions');
    }

    const result = await transactionsService.getUserTransactions(userId, filters);

    return ResponseHandler.paginated(res, result.transactions, result.pagination, 'Transactions retrieved successfully');
  });

  /**
   * @route   GET /api/v1/transactions/:id
   * @desc    Get transaction by ID
   * @access  Private
   */
  getTransactionById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = ['admin', 'system_admin'].includes(req.user.role) ? null : req.user.sub;

    const transaction = await transactionsService.getTransactionById(id, userId);

    return ResponseHandler.success(res, transaction, 'Transaction retrieved successfully');
  });
}

module.exports = new TransactionsController();

