const axios = require('axios');
const generateToken = require('../utils/generateToken');

require('dotenv').config()

const defaultTransactionUrl = "http://alb-762634556.ap-south-1.elb.amazonaws.com:5687/" //using this in case evMachine service api is not set in env 

const token = generateToken(process.env.AUTH_SECRET);

exports.addWalletTransaction = async postData => {
    try {
        let transactionServiceUrl = process.env.TRANSACTION_SERVICE_URL
        if (!transactionServiceUrl) transactionServiceUrl = defaultTransactionUrl

        const response = await axios.post(`${transactionServiceUrl}/api/v1/walletTransaction/create`, postData, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        return response.data.result;
    }
    catch (error) {
        console.error('Error fetching rating:', error);
        return null
    }
}

exports.updateWalletTransaction = async (transactionId, status, paymentId) => {
    try {
        let transactionServiceUrl = process.env.TRANSACTION_SERVICE_URL
        if (!transactionServiceUrl) transactionServiceUrl = defaultTransactionUrl

        const response = await axios.put(`${transactionServiceUrl}/api/v1/walletTransaction/${transactionId}`, { status, paymentId }, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        return response.data.result;
    }
    catch (error) {
        console.error('Error fetching rating:', error);
        return null
    }
}