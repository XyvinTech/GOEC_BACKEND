const axios = require('axios');
require('dotenv').config()
const generateToken = require('../utils/generateToken');


const defaultConfigUrl = "https://dlupfxb3p6.execute-api.ap-south-1.amazonaws.com" //using this in case evMachine service api is not set in env 

const token = generateToken(process.env.AUTH_SECRET);


exports.getChargingTariff = async (chargingTariff = "default") => {
    try {
        let configServiceUrl = process.env.CONFIG_SERVICE_URL
        if (!configServiceUrl) configServiceUrl = defaultConfigUrl
        const response = await axios.get(`${configServiceUrl}/api/v1/chargingTariff/getTotalRate/${chargingTariff}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })

        return response.data.result
    }
    catch (error) {
        console.error('Error fetching rating:', error);
        return null
    }
}