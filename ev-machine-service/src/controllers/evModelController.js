
const createError = require("http-errors")
const EvModel = require('../models/evModelSchema');
const mongoose = require('mongoose');
const OEM = require("../models/OEMSchema");
const _ = require('lodash');

// Create a new EvModel
const createEvModel = async (req, res) => {

    let value = req.body
    const evModel  = new EvModel(value)

    const uniqueConnectorTypes = [...new Set(evModel.connectors.map(connector => connector.type))];
    evModel.charger_type = [...evModel.charger_type, ...uniqueConnectorTypes];

    const savedEvModel = await evModel.save();

    res.status(201).json({ status: true, message: "OK", result: savedEvModel })
}

const getEvModels = async (req, res) => {

    const { pageNo, searchQuery } = req.query;

    const filter = {};

    if (searchQuery) {
        filter.$or = [
            { 'oemDetails.name': { $regex: searchQuery, $options: 'i' } }, 
            { 'oemDetails.oem': { $regex: searchQuery, $options: 'i' } }, 
            { model_name: { $regex: searchQuery, $options: 'i' } }, 
        ];
    }

    const evModelPipeline = [
        { $sort: { updatedAt: -1 } },

        {
            $lookup: {
                from: 'oems',
                localField: 'oem',
                foreignField: '_id',
                as: 'oemDetails'
            }
        },
        { $match: filter },
        {
            $project: {
                _id: 1,
                oem: { $arrayElemAt: ['$oemDetails.name', 0] },
                model_name: 1,
                output_type: 1,
                ocpp_version: 1,
                charger_type: 1,
                capacity: 1,
                no_of_ports: 1,
                connectors: 1
            },
        },
    ];
    const evModelData = await EvModel.aggregate(evModelPipeline).skip(10*(pageNo-1)).limit(10);
    let totalCount = await EvModel.find(filter).countDocuments()
  

    res.status(201).json({ status: true, message: "OK", result: evModelData, totalCount })
};

const getEvModelsDropdown = async (req, res) => {


    const filter = {};

    const evModelPipeline = [
        { $sort: { updatedAt: -1 } },

        {
            $lookup: {
                from: 'oems',
                localField: 'oem',
                foreignField: '_id',
                as: 'oemDetails'
            }
        },
        { $match: filter },
        {
            $project: {
                _id: 1,
                oem: { $arrayElemAt: ['$oemDetails.name', 0] },
                model_name: 1,
                output_type: 1,
                ocpp_version: 1,
                charger_type: 1,
                capacity: 1,
                no_of_ports: 1,
                connectors: 1
            },
        },
    ];
    const evModelData = await EvModel.aggregate(evModelPipeline)
    let totalCount = await EvModel.find(filter).countDocuments()
  

    res.status(201).json({ status: true, message: "OK", result: evModelData, totalCount })
};


// get EvModel data by id
const getEvModel = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new createError(400, `Invalid id ${id}`);
    }

    const data = await EvModel.findById(id);
    if (!data) {
        throw new createError(404, `EvModel with id ${id} not found`);
    }
    res.status(200).json({ status: true, message: "OK", result: data });
};

// update EvModel by id
const updateEvModel = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new createError(400, `Invalid id ${id}`);
    }

    let value = req.body


    const updatedEvModel  = await EvModel.findByIdAndUpdate(id, value, { new: true });
    if (!updatedEvModel ) {
        throw new createError(404, `EvModel with id ${id} not found`);
    }

    const uniqueConnectorTypes = [...new Set(updatedEvModel.connectors.map(connector => connector.type))];
    updatedEvModel.charger_type = [...updatedEvModel.charger_type, ...uniqueConnectorTypes];

    const savedEvModel = await updatedEvModel.save();



    res.status(200).json({ status: true, message: "OK", result: savedEvModel });
};

// delete EvModel by id
const deleteEvModel = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new createError(400, `Invalid id ${id}`);
    }

    const data = await EvModel.findByIdAndDelete(id);
    if (!data) {
        throw new createError(404, `EvModel with id ${id} not found`);
    }
    res.status(200).json({ status: true, message: "OK", result: data });
};


module.exports = {
    createEvModel,
    getEvModel,
    updateEvModel,
    deleteEvModel,
    getEvModels,
    getEvModelsDropdown
}