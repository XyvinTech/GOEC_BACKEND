const Joi = require('joi');

// Define a validation schema for the create-payment-order rout
const paymentOrderSchema = Joi.object({
 
  amount: Joi.number().positive().required(),
  currency: Joi.string().valid('USD', 'EUR', 'GBP','INR').required(),
});

module.exports = paymentOrderSchema;