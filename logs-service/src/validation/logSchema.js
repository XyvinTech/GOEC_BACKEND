const Joi = require('joi');

const logSchema = Joi.object({
  log: Joi.string().required()
});




module.exports = logSchema;