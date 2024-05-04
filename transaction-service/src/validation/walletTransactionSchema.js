const Joi = require('joi');

// Define a validation schema for the wallet transaction route
const walletTransactionSchema = Joi.object({
  user: Joi.string().required(),
  amount: Joi.number().required(),
  transactionId: Joi.string(),
  type: Joi.number().required().valid('charging deduction', 'wallet top-up', 'admin top-up', 'admin deduction', 'other'),
  status: Joi.number().valid('success', 'failure', 'pending', 'canceled'),
});

const walletTransactionEditSchema = Joi.object({
  user: Joi.string(),
  amount: Joi.number(),
  transactionId: Joi.string(),
  type: Joi.number().valid('charging deduction', 'wallet top-up', 'admin top-up', 'admin deduction', 'other'),
  status: Joi.number().valid('success', 'failure', 'pending', 'canceled'),
});

module.exports = {walletTransactionSchema, walletTransactionEditSchema};