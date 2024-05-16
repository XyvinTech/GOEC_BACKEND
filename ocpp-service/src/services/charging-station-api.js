const axios = require('axios');
require("dotenv").config();
const {getSecret} = require('../../config/env.config')
const {axiosErrorHandler} = require('../utils/axiosErrorHandler');
const generateToken = require('../utils/generateToken');


let CS_URL;
let AUTH_SECRET;
let token;
const setURL = async () => {
    let CHARGING_STATION_SERVICE_URL;

    try {
      if (process.env.NODE_ENV !== 'production') {
        CHARGING_STATION_SERVICE_URL = process.env.CHARGING_STATION_SERVICE_URL || 'http://localhost:5100';
      } else {
        const evUrlSecret = await getSecret();
        CHARGING_STATION_SERVICE_URL = evUrlSecret.CHARGING_STATION_SERVICE_URL;
        AUTH_SECRET = evUrlSecret.AUTH_SECRET;
      }

      CS_URL =  `${CHARGING_STATION_SERVICE_URL}/api/v1` 
      token = await generateToken(AUTH_SECRET);

    } catch (error) {
      console.error('Error setting secrets:', error);
      process.exit(1);
    }
  };



  const getChargingStationListWithEvDetails = async () => {
    try {
        await setURL();
        //!need to setup this api,currently dummy
        const response = await axios.get(`${CS_URL}/chargingStations/ocpi/list` ,{
          headers: {
            Authorization: `Bearer ${token}`,
        }
        })
        return response.data.status

    } catch (error) {
      axiosErrorHandler(error)
    }

}

module.exports={getChargingStationListWithEvDetails}
