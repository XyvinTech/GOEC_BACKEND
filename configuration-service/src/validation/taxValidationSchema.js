const Joi = require('joi');

const taxValidationSchema = Joi.object({
  name: Joi.string().required(),
  percentage: Joi.number().required(),
  status: Joi.boolean().required(),
});

module.exports = taxValidationSchema;
