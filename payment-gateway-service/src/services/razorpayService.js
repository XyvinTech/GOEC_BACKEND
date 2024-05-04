const generateUniqueID = require('../utils/generateUniqueID')
const Razorpay = require('razorpay')
const crypto = require('crypto')
const createError = require('http-errors')
const { error } = require('console')

exports.createRazorPaymentOrder = async (amount, currency) => {
  try {
    // initializing razorpay
    const instance = new Razorpay({
      // key_id: process.env.RAZORPAY_ID_KEY,
      // key_secret: process.env.RAZORPAY_SECRET_KEY,
      // key_id: process.env.RAZOR_TEST_ID,
      // key_secret: process.env.RAZOR_TEST_SECRET,
    })
    
    // setting up options for razorpay order.
    const options = {
      amount: Number(amount) * 100,
      currency: currency,
      receipt: generateUniqueID(),
    }

    const order = await instance.orders.create(options)

    if (order.error) throw error // if any payment error throw error value in catch

    return order //else true
  } catch (error) {
    console.log(error)
    throw new createError(400, 'Bad request - Payment Gateway')
  }
}
