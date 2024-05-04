const Joi = require('joi');

// Define a validation schema for the create-payment-order route
const notificationSchema = Joi.object({
  email: Joi.string().email().required(),
  subject: Joi.string().required(),
  notificationHeading: Joi.string(),
  notificationContent: Joi.string().required(),
});

// Define a validation schema for sms
const smsSchema = Joi.object({
  phoneNumber: Joi.number().required(),
  message: Joi.string().required(),
});


module.exports = {notificationSchema, smsSchema};