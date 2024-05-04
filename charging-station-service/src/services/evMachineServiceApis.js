const axios = require('axios');
require('dotenv').config()
const generateToken = require('../utils/generateToken');

const defaultEvMachineUrl = "https://oxium.goecworld.com:5691" //using this in case evMachine service api is not set in env 

const token = generateToken(process.env.AUTH_SECRET);


exports.getChargerDetails = async evMachine => {
    try {
        let evMachineServiceUrl = process.env.EV_MACHINE_URL
        if (!evMachineServiceUrl) evMachineServiceUrl = defaultEvMachineUrl

        const response = await axios.get(`${evMachineServiceUrl}/api/v1/evMachine/${evMachine}`, {
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

exports.deleteChargers = async evMachine => {
    try {
        let evMachineServiceUrl = process.env.EV_MACHINE_URL
        if (!evMachineServiceUrl) evMachineServiceUrl = defaultEvMachineUrl
        const response = await axios.delete(`${evMachineServiceUrl}/api/v1/evMachineByStationId/${evMachine}`, {
            headers: {
                Authorization: token
            }
        })
        return response.data.result;
    }
    catch (error) {
        console.error('Error fetching rating:', error);
        return null
    }
}