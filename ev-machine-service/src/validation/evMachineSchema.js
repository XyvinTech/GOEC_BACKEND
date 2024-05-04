const Joi = require('joi');

const evMachineSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid('DC', 'AC').required(),
  status: Joi.string().required(),
  power: Joi.number(),
  CPID: Joi.string(),
  OEM: Joi.string(),
  chargerTariff: Joi.string(),
  voltage: Joi.number(),
  // connectorType: Joi.string(),
  // connectorStatus: Joi.string(),
});

const evMachineEditSchema = Joi.object({
  name: Joi.string(),
  type: Joi.string().valid('DC', 'AC'),
  status: Joi.string().required(),
  power: Joi.number(),
  CPID: Joi.string(),
  OEM: Joi.string(),
  chargerTariff: Joi.string(),
  voltage: Joi.number(),
  // connectorType: Joi.string(),
  // connectorStatus: Joi.string(),
});

const updateStatusSchema = Joi.object({
  connectorId: Joi.number().required(),
  status: Joi.string().required(),
  errorCode:Joi.string().required(),
  timestamp:Joi.string(),
  vendorId:Joi.string(),
  info:Joi.string().optional().allow(''),
  vendorErrorCode:Joi.string().allow(''),

})

module.exports = {evMachineSchema, evMachineEditSchema, updateStatusSchema};