const router = require('express').Router()
const walletTransactionController = require('../controllers/walletTransactionController')
const asyncHandler = require('../utils/asyncHandler')

//Wallet Transaction apis
router
  .post('/walletTransaction/create', asyncHandler(walletTransactionController.createWalletTransaction))
  .post('/walletTransaction/createOrUpdate', asyncHandler(walletTransactionController.createOrUpdateTransaction))
  .get('/walletTransaction/list', asyncHandler(walletTransactionController.getWalletTransactionList))
  .post('/walletTransaction/filteredList', asyncHandler(walletTransactionController.getFilteredWalletTransactionList))
  .get('/walletTransaction/:transactionId', asyncHandler(walletTransactionController.getWalletTransactionById))
  .put('/walletTransaction/:transactionId', asyncHandler(walletTransactionController.updateWalletTransaction))
  .delete('/walletTransaction/:transactionId', asyncHandler(walletTransactionController.deleteWalletTransaction))

  .get('/walletTransaction/dashboard/list', asyncHandler(walletTransactionController.dashboardTransactionList))
  .get('/walletTransaction/dashboard/report', asyncHandler(walletTransactionController.getReport))
  .get('/walletTransaction/dashboard/account-transaction/report', asyncHandler(walletTransactionController.getAccountTransactionReport))
  .post('/walletTransaction/dashboardUser/list', asyncHandler(walletTransactionController.dashboardUserTransactionList))

module.exports = router
