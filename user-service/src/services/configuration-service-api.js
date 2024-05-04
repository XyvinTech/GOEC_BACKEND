const axios = require('axios');
require('dotenv').config();
const CONFIG_SERVICE_URL = process.env.CONFIG_SERVICE_URL
const { axiosErrorHandler } = require('../utils/axiosErrorHandler');
const generateToken = require('../utils/generateToken');




const getConfigValue = async (configName) => {
    const token = generateToken(process.env.AUTH_SECRET);
    try {
        const response = await axios.get(`${CONFIG_SERVICE_URL}/api/v1/config/byName/${configName}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        if (response) { return response.data.result }
        else {
            return false
        }
    } catch (error) {
        axiosErrorHandler(error)
    }

}

const getDefaultChargingTariff = async (configName) => {
    try {
        const tariff = await USER.aggregate(
            [
                { $limit: 1 },
                {
                    $lookup: {
                        from: "chargingtariffs",
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$name", "Default"],
                                    }, // Compare with the hardcoded value
                                },
                            },
                        ],

                        as: "chargingTariffDetails",
                    },
                },
                {
                    $unwind: '$chargingTariffDetails'
                },
                {
                    $project:
                    {
                        _id: 0,
                        chargingTariffId:
                            "$chargingTariffDetails._id",
                    },
                },
            ]
        )

        return tariff[0].chargingTariffId
    } catch (error) {
        axiosErrorHandler(error)
    }

}

module.exports = { getConfigValue, getDefaultChargingTariff }