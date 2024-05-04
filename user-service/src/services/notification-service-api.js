const axios = require('axios');
require('dotenv').config();
const NOTIFICATION_URL = process.env.NOTIFICATION_SERVICE_URL
const { axiosErrorHandler } = require('../utils/axiosErrorHandler');
const generateToken = require('../utils/generateToken');


const token = generateToken(process.env.AUTH_SECRET);


const sendOTPBySMS = async (mobileNo, otp) => {

    try {

        let payload = {
            phoneNumber: mobileNo,
            otp: otp
        }
        const response = await axios.post(`${NOTIFICATION_URL}/api/v1/notification/sendSms`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        if (!response.status) throw (`OTP Error: SMS send failed`)
        return response
    } catch (error) {
        axiosErrorHandler(error)
    }

}


const sendWelcomeMail = async (payload) => {

    try {

     
        const response = await axios.post(`${NOTIFICATION_URL}/api/v1/notification/sendMailToAdmin`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        if (!response.status) throw (`OTP Error: SMS send failed`)
        return response
    } catch (error) {
        axiosErrorHandler(error)
    }

}

module.exports = { sendOTPBySMS,sendWelcomeMail }