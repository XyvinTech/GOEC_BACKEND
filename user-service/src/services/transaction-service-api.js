const axios = require('axios');
require('dotenv').config();
const transactionServiceUrl = process.env.TRANSACTION_SERVICE_URL
const { axiosErrorHandler } = require('../utils/axiosErrorHandler')
const USER = require('../models/userSchema');
const generateToken = require('../utils/generateToken');

const token = generateToken(process.env.AUTH_SECRET);

const updateWalletTransaction = async (user, amount, reference, type) => {
    try {
        // send request to transaction service to update in wallet transaction collection
        const postData = {
            "user": user,
            "amount": amount,
            "type": type,
            "status": "success",
            // transactionId,
            "reference": reference,
            "initiated_by":"admin",
            userWalletUpdated: true,
        }

        const response = await axios.post(`${transactionServiceUrl}/api/v1/walletTransaction/create`, postData, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        if (response) { return response.status }
        else return false
    } catch (error) {
        axiosErrorHandler(error)
    }

}

module.exports = { updateWalletTransaction }