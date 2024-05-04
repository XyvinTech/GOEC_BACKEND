const jwt = require("jsonwebtoken");
require('dotenv').config()

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1y",
  });
};

module.exports = generateToken;