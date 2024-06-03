const createError = require("http-errors");
const EvMachine = require("../models/evMachineSchema");
const mongoose = require('mongoose')
const moment = require('moment');
const { log } = require("console");
const ObjectId = mongoose.Types.ObjectId;

exports.getDashboardList = async (req, res) => {

    const locations = req.role.location_access;

    const { pageNo, searchQuery } = req.query;

    const filter = {};

    if (searchQuery) {
        filter.$or = [
            { name: { $regex: searchQuery, $options: 'i' } }, 
            { CPID: { $regex: searchQuery, $options: 'i' } }, 
            { cpidStatus: { $regex: searchQuery, $options: 'i' } }, 
            { authorization_key: { $regex: searchQuery, $options: 'i' } }, 
            { 'chargingStationDetails.name': { $regex: searchQuery, $options: 'i' } },
            { 'evModelDetails.oem': { $regex: searchQuery, $options: 'i' } }
        ];
    }

    if(locations){
        filter['chargingStationDetails._id'] = { $in: locations };
    }

    let pipedData = await EvMachine.aggregate([
        { $sort: { updatedAt: -1 } },

        {
            $lookup: {
                from: 'chargingstations',
                localField: 'location_name',
                foreignField: '_id',
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            address: 1,
                            published: 1,

                        }
                    }
                ],
                as: 'chargingStationDetails'
            }
        },

        {
            $lookup: {
                from: 'ev_models', // Replace with your actual evModel collection name
                localField: 'evModel',
                foreignField: '_id',
                pipeline: [
                    {
                        $lookup: { // Nested lookup for the oem collection
                            from: 'oems', // Replace with your actual oem collection name
                            localField: 'oem',
                            foreignField: '_id',
                            as: 'oemDetails'
                        }
                    },
                    {
                        $unwind: {
                            path: '$oemDetails',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            model_name: 1, // Replace 'phone' with the actual field name for phone
                            oem: '$oemDetails.name',
                            output_type: 1,

                        }
                    }
                ],
                as: 'evModelDetails'
            }
        },
        { $match: filter },

        {
            $lookup: {
                from: 'chargingtariffs', // Replace with your actual chargerTariff collection name
                localField: 'chargingTariff',
                foreignField: '_id',
                pipeline: [
                    {
                        $lookup: { // Nested lookup for the oem collection
                            from: 'taxes', // Replace with your actual oem collection name
                            localField: 'tax',
                            foreignField: '_id',
                            as: 'taxDetails'
                        }
                    },
                    {
                        $unwind: {
                            path: '$taxDetails',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            tariffType: 1,
                            value: 1,
                            serviceAmount: 1,
                            tax_name: '$taxDetails.name',
                            tax_percentage: '$taxDetails.percentage',

                        }
                    }
                ],
                as: 'chargingTariffDetails'
            }
        },
        {
            $unwind: {
                path: '$chargingStationDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: '$evModelDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: '$chargingTariffDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                CPID: 1,
                cpidStatus: 1,
                name: 1,
                published: 1,
                chargingStation: '$chargingStationDetails.name',
                chargingTariff: '$chargingTariffDetails.tax_name',
                evModel: '$evModelDetails.model_name',
                oem: '$evModelDetails.oem',
                authorization_key: 1,
                serial_number: 1,
                commissioned_date: 1,
                configuration_url: 1,
                cpidStatus: 1,
                createdAt: 1


            }
        }



    ]).skip(10*(pageNo-1)).limit(10);

    let result = pipedData
    let totalCount = await EvMachine.find(filter).countDocuments()

    res.send({ status: true, message: 'OK', result: result, totalCount })
}


exports.getDashboardListById = async (req, res) => {

    let id = req.params.id;



    let pipedData = await EvMachine.aggregate([

        { $match: { _id: new mongoose.Types.ObjectId(id) } },


        {
            $lookup: {
                from: 'chargingstations',
                localField: 'location_name',
                foreignField: '_id',
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            address: 1,
                            published: 1,

                        }
                    }
                ],
                as: 'chargingStationDetails'
            }
        },

        {
            $lookup: {
                from: 'ev_models', // Replace with your actual evModel collection name
                localField: 'evModel',
                foreignField: '_id',
                pipeline: [
                    {
                        $lookup: { // Nested lookup for the oem collection
                            from: 'oems', // Replace with your actual oem collection name
                            localField: 'oem',
                            foreignField: '_id',
                            as: 'oemDetails'
                        }
                    },
                    {
                        $unwind: {
                            path: '$oemDetails',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            model_name: 1, // Replace 'phone' with the actual field name for phone
                            oem: '$oemDetails.name',
                            output_type: 1,
                            ocpp_version: 1,
                            charger_type: 1,
                            capacity: 1,
                            no_of_ports: 1,
                            connectors: 1,
                            model_name: 1

                        }
                    }
                ],
                as: 'evModelDetails'
            }
        },
        {
            $lookup: {
                from: 'ocpptransactions', // Replace with your actual evModel collection name
                localField: 'CPID',
                foreignField: 'cpid',
                as: 'transactionDetails'
            }
        },



        {
            $project: {
                _id: 1,
                name: 1,
                CPID: 1,
                authorization_key: 1,
                configuration_url: 1,
                serial_number: 1,
                commissioned_date: 1,
                published: 1,
                connectors: 1,
                cpidStatus: 1,
                commissioned_date: 1,
                published: 1,
                chargingStationDetails: 1,

                evModelDetails: 1,
                numTransactions: { $size: "$transactionDetails" },
                totalAmountReceived: {
                    $round: [{
                        $sum: "$transactionDetails.totalAmount"
                    }, 2]
                },
                totalEnergyUsed: {
                    $sum: {
                        $map: {
                            input: "$transactionDetails",
                            as: "transaction",
                            in: {
                                $sum: [
                                    { $subtract: ["$$transaction.meterStop", "$$transaction.meterStart"] },

                                ]
                            }
                        }
                    }
                },
            }
        },



    ]);

    let result = pipedData[0]





    res.send({ status: true, message: 'OK', result: result })
}

exports.getTariff = async (req, res) => {

    let pipedData = await EvMachine.aggregate([
        { $match: { CPID: req.params.cpid } },
        {
            $lookup: {
                from: 'chargingtariffs', // Replace with your actual chargerTariff collection name
                localField: 'chargingTariff',
                foreignField: '_id',
                pipeline: [
                    {
                        $lookup: { // Nested lookup for the oem collection
                            from: 'taxes', // Replace with your actual oem collection name
                            localField: 'tax',
                            foreignField: '_id',
                            as: 'taxDetails'
                        }
                    },
                    {
                        $unwind: {
                            path: '$taxDetails',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    {
                        $project: {
                            name: 1,
                            tariffType: 1,
                            value: 1,
                            serviceAmount: 1,
                            tax_name: '$taxDetails.name',
                            tax_percentage: '$taxDetails.percentage',

                        }
                    }
                ],
                as: 'chargingTariffDetails'
            }
        },
        {
            $unwind: {
                path: '$chargingTariffDetails',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                CPID: 1,
                chargingTariffDetail: '$chargingTariffDetails',
            }
        }



    ]);

    let result = pipedData
    res.send({ status: true, message: 'OK', result: result })
}



exports.ChangeTariff = async (req, res) => {

    let chargingTariff = req.body.chargingTariff
    let cpid = req.params.cpid
    let updateData = chargingTariff ? { $set: { chargingTariff: chargingTariff } } : { $unset: { chargingTariff: 1 } };


    await EvMachine.findByIdAndUpdate(cpid, updateData)

    res.send({ status: true, message: 'Updated!!' })
}

exports.getReport = async (req, res) => {


    const { startDate, endDate, location } = req.body;
    const matchStage = {
        $match: {}
    };

    if (startDate && endDate) {
        const dateFormat = 'DD-MM-YYYY';
        const startMoment = moment(startDate, dateFormat);
        const endMoment = moment(endDate, dateFormat).endOf('day');
        matchStage.$match.createdAt = {
            $gte: startMoment.toDate(),
            $lte: endMoment.toDate()
        };
    }

    if (location) matchStage.$match.location_name = new mongoose.Types.ObjectId(location);

    log(matchStage);

    let pipedData = await EvMachine.aggregate([
        matchStage,
        {
            $lookup: {
                from: "chargingstations",
                localField: "location_name",
                foreignField: "_id",
                pipeline: [

                    {
                        $project: {
                            name: 1,
                        }
                    }
                ],
                as: "location",
            }
        },
        {
            $unwind: {
                path: "$location",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                authorization_key: 1,
                serial_number: 1,
                commissioned_date: 1,
                published: 1,
                evModel: 1,
                CPID: 1,
                chargingTariff: 1,
                connectors: {
                    $map: {
                        input: "$connectors",
                        as: "connector",
                        in: {
                            connectorId: "$$connector.connectorId",
                            status: "$$connector.status",
                            errorCode: "$$connector.errorCode",
                            info: "$$connector.info",
                            timestamp: "$$connector.timestamp",
                            vendorId: "$$connector.vendorId",
                            vendorErrorCode: "$$connector.vendorErrorCode",
                            _id: "$$connector._id"
                        }
                    }
                },
                configuration_url: 1,
                cpidStatus: 1,
                createdAt: 1,
                updatedAt: 1,
                "location": "$location.name"
            }
        }

    ])


    let result = pipedData
    res.status(200).json({ status: true, message: 'OK', result: result })
}

exports.getReport2 = async (req, res) => {
    let { startDate, endDate } = req.query
    let filters = {}
    if (startDate && endDate) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(startDate) && /^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
            let fromDate = moment(startDate, "YYYY-MM-DD").toDate()
            let toDate = moment(endDate, "YYYY-MM-DD").toDate()
            toDate.setDate(toDate.getDate() + 1)
            filters.createdAt = { $gte: fromDate, $lt: toDate }
        }
        else return res.status(400).json({ status: false, message: 'Date should be in "YYYY-MM-DD" Format' })
    }

    let result = await EvMachine.aggregate([
        { $match: filters },
        {
            $sort: {
                updatedAt: -1,
            },
        },
        {
            $lookup: {
                from: "chargingstations",
                localField: "location_name",
                foreignField: "_id",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            address: 1,
                            published: 1,
                            state: 1,
                            city: 1,
                            latitude: 1,
                            longitude: 1,
                        },
                    },
                ],
                as: "chargingStationDetails",
            },
        },
        {
            $lookup: {
                from: "ev_models",
                // Replace with your actual evModel collection name
                localField: "evModel",
                foreignField: "_id",
                pipeline: [
                    {
                        $lookup: {
                            // Nested lookup for the oem collection
                            from: "oems",
                            // Replace with your actual oem collection name
                            localField: "oem",
                            foreignField: "_id",
                            as: "oemDetails",
                        },
                    },
                    {
                        $unwind: {
                            path: "$oemDetails",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $project: {
                            model_name: 1,
                            // Replace 'phone' with the actual field name for phone
                            oem: "$oemDetails.name",
                            output_type: 1,
                            charger_type: 1,
                            connectors: 1,
                            capacity: 1,
                        },
                    },
                ],
                as: "evModelDetails",
            },
        },
        {
            $lookup: {
                from: "chargingtariffs",
                // Replace with your actual chargerTariff collection name
                localField: "chargingTariff",
                foreignField: "_id",
                pipeline: [
                    {
                        $lookup: {
                            // Nested lookup for the oem collection
                            from: "taxes",
                            // Replace with your actual oem collection name
                            localField: "tax",
                            foreignField: "_id",
                            as: "taxDetails",
                        },
                    },
                    {
                        $unwind: {
                            path: "$taxDetails",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $project: {
                            tariffType: 1,
                            value: 1,
                            serviceAmount: 1,
                            tax_name: "$taxDetails.name",
                            tax_percentage:
                                "$taxDetails.percentage",
                        },
                    },
                ],
                as: "chargingTariffDetails",
            },
        },
        {
            $unwind: {
                path: "$chargingStationDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: "$evModelDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $unwind: {
                path: "$chargingTariffDetails",
                preserveNullAndEmptyArrays: true,
            },
        },
        {
            $project: {
                _id: 1,
                CPID: 1,
                cpidStatus: 1,
                name: 1,
                published: 1,
                chargingStation:
                    "$chargingStationDetails.name",
                latitude:
                    "$chargingStationDetails.latitude",
                longitude:
                    "$chargingStationDetails.longitude",
                state: "$chargingStationDetails.state",
                chargingTariffDetails:
                    "$chargingTariffDetails",
                chargingTariff:
                    "$chargingTariffDetails.tax_name",
                chargingTariffType:
                    "$chargingTariffDetails.tariffType",
                chargingTariffTax:
                    "$chargingTariffDetails.tax",
                model: "$evModelDetails.model_name",
                connectorStandard:
                    "$evModelDetails.output_type",
                tax_percentage:
                    "$chargingTariffDetails.tax_percentage",
                connectors: "$evModelDetails.connectors",
                chargerTypes:
                    "$evModelDetails.charger_type",
                capacity: "$evModelDetails.capacity",
                oem: "$evModelDetails.oem",
                authorization_key: 1,
                serial_number: 1,
                commissioned_date: 1,
                configuration_url: 1,
                cpidStatus: 1,
                createdAt: 1,
            },
        },
    ]);

    if (!result.length) return res.status(400).json({ status: false, message: 'No Data Found' })

    result = result.map(transaction => {
        let chargingTariffRate = ""
        if (transaction) {
            let totalAmount = Number(transaction.chargingTariffDetails.serviceAmount) + Number(transaction.chargingTariffDetails.value)
            chargingTariffRate += totalAmount + (totalAmount * (transaction.tax_percentage / 100))
        }


        return {
            ...transaction,
            createdAt: moment(transaction.createdAt).format("DD-MM-YYYY HH:mm:ss"),
            connectorType: transaction.chargerTypes ? transaction.chargerTypes.join(', ') : "",
            chargingTariffRate: chargingTariffRate,
        }
    })

    const headers = [
        { header: "Location Name", key: "chargingStation" },
        { header: "Charge Point Id", key: "CPID" },
        { header: "State", key: "state" },
        { header: "Model Name", key: "model" },
        { header: "OEM Name", key: "oem" },
        { header: "Connector Standard(AC/DC)", key: "connectorStandard" },
        { header: "Type of Connector", key: "connectorType" },
        { header: "Power", key: "capacity" },
        { header: "Created On", key: "createdAt" },
        { header: "Commissioned On", key: "commissioned_date" },
        { header: "Charging Tariff Name", key: "chargingTariff" },
        { header: "Charging Tariff Type", key: "chargingTariffType" },
        { header: "Charging Tariff Rate( / kWh, / min)", key: "chargingTariffRate" },
        { header: "Charging Tariff Tax", key: "tax_percentage" },
        { header: "Chargepoint Latitude", key: "latitude" },
        { header: "Chargepoint Longitude", key: "longitude" },
    ]

    try {


        res.status(200).json({ status: true, message: 'OK', result: { headers: headers, body: result } })
    }
    catch (error) {
        res.status(400).json({ status: false, message: "Internal Server Error" })
    }

}