const express = require('express');
const transactionsController = require('../controllers/transactions.controller');

const router = express.Router();

// All routes require authentication (handled by API Gateway)

router.post('/reserve', transactionsController.reservePlot);
router.post('/buy', transactionsController.buyPlot);
router.post('/:id/verify', transactionsController.verifyPayment);
router.get('/user/:userId', transactionsController.getUserTransactions);
router.get('/:id', transactionsController.getTransactionById);

module.exports = router;

