const axios = require('axios');
const { isMongoId } = require('../utils/mongoIdChecker')
require('dotenv').config();
const RFID_URL = process.env.RFID_SERVICE_URL
const { axiosErrorHandler } = require('../utils/axiosErrorHandler');
const generateToken = require('../utils/generateToken');

const token = generateToken(process.env.AUTH_SECRET);


const getRFIDMongoId = async (rfidSerialNumber) => {
    try {
        const response = await axios.get(`${RFID_URL}/api/v1/rfid/rfidbySerialNumber/${rfidSerialNumber}`,{
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        if (response) { return response.data.rfid }
        else {
            return false
        }
    } catch (error) {
        axiosErrorHandler(error)
    }

}

module.exports = { getRFIDMongoId }