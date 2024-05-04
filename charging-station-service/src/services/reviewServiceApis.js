const axios = require('axios');
require('dotenv').config()
const generateToken = require('../utils/generateToken');

const staticGlobalUrl = "http://alb-762634556.ap-south-1.elb.amazonaws.com:5685" //using this in case review service api or evMachine service api is not set in env 

const token = generateToken(process.env.AUTH_SECRET);


exports.getRating = async chargingStationId => {
    try {
        let reviewServiceUrl = process.env.REVIEW_SERVICE_URL
        if (!reviewServiceUrl) reviewServiceUrl = staticGlobalUrl
        let evMachine = 'null'
        const response = await axios.get(`${reviewServiceUrl}/api/v1/reviews/averageRating/${chargingStationId}/${evMachine}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data.result;
    }
    catch (error) {
        console.error('Error fetching rating:', error);
        return null
    }
}

exports.getRatingForDashboard = async chargingStationId => {
    try {
        let reviewServiceUrl = process.env.REVIEW_SERVICE_URL
        if (!reviewServiceUrl) reviewServiceUrl = staticGlobalUrl
       
        const response = await axios.get(`${reviewServiceUrl}/api/v1/review/byChargingStation/${chargingStationId}`, {
            headers: {
                Authorization: token
            }
        });
        return response.data.result;
    }
    catch (error) {
        console.error('Error fetching rating:', error);
        return null
    }
}