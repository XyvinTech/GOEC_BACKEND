require('dotenv').config()
const axios = require('axios');
const generateToken = require('../src/utils/generateToken');

const defaultTransactionUrl = "http://alb-762634556.ap-south-1.elb.amazonaws.com:5688" //using this in case evMachine service api is not set in env 

exports.addToWallet = async (userId, postData) => {
    const token = generateToken(process.env.AUTH_SECRET);

    try {
        let userServiceUrl = process.env.USER_SERVICE_URL
        if (!userServiceUrl) userServiceUrl = defaultTransactionUrl

        const response = await axios.put(`${userServiceUrl}/api/v1/users/addToWallet/${userId}`, postData,{
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        return response.data.status;
    }
    catch (error) {
        console.error('Error fetching rating:', error);
        return null
    }
}