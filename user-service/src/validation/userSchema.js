const Joi = require('joi');

// Define a validation schema for the create-payment-order route
const userSchema = Joi.object({
  username: Joi.string(),
  email: Joi.string().email(),
  mobile: Joi.string().required(),
  total_sessions: Joi.number().optional(),
  wallet: Joi.number().default(0),
  otp: Joi.string().optional(),
  firebaseToken: Joi.string().optional(),
  total_units: Joi.number().optional(),
  chargingTariff: Joi.string(),
  profileImage: Joi.string().optional(),
  vehicle: Joi.array().items(
    Joi.object({
      vehicleRef: Joi.string().pattern(/^[0-9a-fA-F]{24}$/), // Assuming ObjectId is a string
      evRegNumber: Joi.string(),
      defaultVehicle: Joi.boolean(),
    })
  ).optional(),

  rfidTag: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).optional(), // Assuming ObjectId is a string
  favoriteStations: Joi.array().items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/)).optional(), // Assuming ObjectId is a string
});

const userEditSchema = Joi.object({
  username: Joi.string(),
  email: Joi.string().email(),
  mobile: Joi.string(),
  chargingTariff: Joi.string(),
  profileImage: Joi.string(),
  firebaseToken: Joi.string().optional().allow('')
});

module.exports = { userSchema, userEditSchema };