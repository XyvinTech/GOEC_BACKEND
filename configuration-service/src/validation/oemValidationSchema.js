const Joi = require('joi');

const oemValidationSchema = Joi.object({
  name: Joi.string().required(),
  model_name: Joi.string(),
  output_type: Joi.string().valid('AC', 'DC'),
  ocpp_version: Joi.string().valid('1.6', '1.6J', '2.0'),
  rated_voltages: Joi.number(),
  capacity: Joi.number(),
  no_of_ports: Joi.number(),
  type_of_port: Joi.array().items(Joi.string()), // Assuming type_of_port is an array of strings
});

module.exports = oemValidationSchema;
