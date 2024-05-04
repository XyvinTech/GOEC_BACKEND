const Joi = require('joi');

// Define a validation schema for the create-payment-order route
const chargingStationSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  owner: Joi.string().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  chargers: Joi.array().items(Joi.string()),
  status: Joi.string(),
  type: Joi.string(),
  image: Joi.string(),
  startTime: Joi.string(),
  stopTime: Joi.string(),
  amenities: Joi.string(),
});

const chargingStationEditSchema = Joi.object({
  name: Joi.string(),
  address: Joi.string(),
  latitude: Joi.number(),
  longitude: Joi.number(),
  chargers: Joi.array().items(Joi.string()),
  status: Joi.string(),
  type: Joi.string(),
  image: Joi.string(),
  startTime: Joi.string(),
  stopTime: Joi.string(),
  amenities: Joi.string(),
});

module.exports = {chargingStationSchema, chargingStationEditSchema};