const Joi = require('joi');

const rfidValidationSchema = Joi.object({
  serialNumber: Joi.string().required(),
  status: Joi.string().valid('active', 'inactive', 'unassigned').default('pending'),
  expiry: Joi.date().optional(),
});

module.exports = rfidValidationSchema;
