const axios = require("axios"); // Import Axios for making HTTP requests
require("dotenv").config();
const { axiosErrorHandler } = require("../utils/axiosErrorHandler");
const { getSecret } = require("../../config/env.config");
const generateToken = require("../utils/generateToken");

let NOTIFICATION_URL;
let AUTH_SECRET;
let ACCESS_TOKEN_SECRET
let token;
let mailToken = process.env.ACCESS_TOKEN_SECRET;
const setURL = async () => {
  let NOTIFICATION_SERVICE_URL;

  try {
    if (process.env.NODE_ENV !== "production") {
      NOTIFICATION_SERVICE_URL =
        process.env.NOTIFICATION_SERVICE_URL || "http://localhost:5682";
    } else {
      const userUrlSecret = await getSecret();
      NOTIFICATION_SERVICE_URL = userUrlSecret.NOTIFICATION_SERVICE_URL;
      AUTH_SECRET = userUrlSecret.AUTH_SECRET;
      ACCESS_TOKEN_SECRET= userUrlSecret.ACCESS_TOKEN_SECRET
      mailToken = await generateToken(ACCESS_TOKEN_SECRET);
      token = await generateToken(AUTH_SECRET);
    }

    NOTIFICATION_URL = `${NOTIFICATION_SERVICE_URL}/api/v1/notification`;
  } catch (error) {
    console.error("Error setting secrets:", error);
    process.exit(1);
  }
};

const saveNotification = async (title, body, user) => {
  try {
    await setURL();

    const response = await axios.post(
      `${NOTIFICATION_URL}/save`,
      { title, body, users: [user] },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    let res = response.data;
    if (!res.status)
      throw new Error(`Some error from service connections/UnAuthorized`);
    return res.status;
  } catch (error) {
    axiosErrorHandler(error);
  }
};

const sendEmail = async (data) => {
  try {
    await setURL();
    const response = await axios.post(`${NOTIFICATION_URL}/sendMail`, data, {
      headers: {
        Authorization: `Bearer ${mailToken}`,
      },
    });

    let res = response;
    if (!res.status)
      throw new Error(`Some error from service connections/UnAuthorized`);
    return res.status;
  } catch (error) {
    axiosErrorHandler(error);
  }
};

module.exports = { saveNotification, sendEmail };
