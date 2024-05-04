const Joi = require('joi');

const chargingTariffValidationSchema = Joi.object({
  name: Joi.string().disallow('Default').required(),
  tariffType: Joi.string().valid('energy', 'time'),
  value: Joi.number().required(),
  serviceAmount: Joi.number().required(),
  tax: Joi.string().required(),
});

const chargingTariffUpdateValidationSchema = Joi.object({
  name: Joi.string().disallow('Default'),
  tariffType: Joi.string().valid('energy', 'time'),
  value: Joi.number(),
  serviceAmount: Joi.number(),
  tax: Joi.string(),
});


const chargingTariffDefaultValidationSchema = Joi.object({
  value: Joi.number().required(),
  serviceAmount: Joi.number().required(),
  tax: Joi.string().required(),
});

const chargingTariffDefaultUpdateValidationSchema = Joi.object({
  value: Joi.number(),
  serviceAmount: Joi.number(),
  tax: Joi.string(),
});

module.exports = {chargingTariffValidationSchema, chargingTariffUpdateValidationSchema, chargingTariffDefaultValidationSchema, chargingTariffDefaultUpdateValidationSchema};
