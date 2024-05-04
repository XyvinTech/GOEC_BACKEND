const Joi = require('joi');

const reviewSchema = Joi.object({
  user: Joi.string().required(),
  chargingStation: Joi.string(),
  evMachine: Joi.string(),
  rating: Joi.number().min(0).max(5),
  comment: Joi.string(),
});

const reviewEditSchema = Joi.object({
  // user: Joi.string(),
  chargingStation: Joi.string(),
  evMachine: Joi.string(),
  rating: Joi.number().min(0).max(5),
  comment: Joi.string(),
});


module.exports = {reviewSchema, reviewEditSchema};