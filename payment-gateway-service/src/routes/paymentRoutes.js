const router = require('express').Router()
const paymentController = require('../controllers/paymentController');
const authVerify = require('../middlewares/authVerify');
const asyncHandler = require('../utils/asyncHandler')
// test
router.post('/payment/paymentOrder', authVerify, asyncHandler(paymentController.createPaymentOrder));

router.post('/payment/paymentVerify', authVerify, asyncHandler(paymentController.paymentVerify));

router.get('/payment/paymentVerify/v2', asyncHandler(paymentController.khaltiVerify));

// router.get('/payment/paymentVerify/v2', asyncHandler(verifyKhaltiPayment));

module.exports = router
