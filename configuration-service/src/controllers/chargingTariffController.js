const ChargingTariff = require('../models/chargingTariffSchema');
const mongoose = require('mongoose');
const createError = require("http-errors")
const { chargingTariffValidationSchema, chargingTariffUpdateValidationSchema, chargingTariffDefaultValidationSchema, chargingTariffDefaultUpdateValidationSchema } = require('../validation/chargingTariffValidationSchema');
const { getTaxPercentage } = require('./taxController')

// create chargingTariff
const createChargingTariff = async (req, res) => {
    const { error, value } = chargingTariffValidationSchema.validate(req.body)

    if (error) {
        throw new createError(
            400,
            error.details.map((detail) => detail.message).join(', ')
        );
    }

    const chargingTariff = new ChargingTariff(value)
    const savedChargingTariff = await chargingTariff.save()
    res.status(201).json(savedChargingTariff)
}

// default chargingTariff - create/edit
const createDefaultChargingTariff = async (req, res) => {
    let defaultChargingTariff = await ChargingTariff.findOne({ isDefault: true }, '_id')

    if (defaultChargingTariff) {
        const { error, value } = chargingTariffDefaultUpdateValidationSchema.validate(req.body)

        if (error) {
            throw new createError(
                400,
                error.details.map((detail) => detail.message).join(', ')
            );
        }

        const chargingTariff = await ChargingTariff.findByIdAndUpdate(defaultChargingTariff._id, { $set: req.body }, { new: true })
        res.status(200).json(chargingTariff)
    }
    else {
        const { error, value } = chargingTariffDefaultValidationSchema.validate(req.body)

        if (error) {
            throw new createError(
                400,
                error.details.map((detail) => detail.message).join(', ')
            );
        }


        const chargingTariff = new ChargingTariff({ ...value, name: 'Default', isDefault: true })
        const savedChargingTariff = await chargingTariff.save()
        res.status(201).json(savedChargingTariff)
    }
}

//get  Default Charging tariff

const getDefaultChargingTariff = async (req, res) =>{


    let result = await ChargingTariff.findOne({name:'Default'})
    res.status(200).json({status:true,result: result})
}

// get all chargingTariff with
const getChargingTariffList = async (req, res) => {

    const { pageNo, searchQuery } = req.query;

    const filter = {};


    if (searchQuery) {
        filter.$or = [
            { name: { $regex: searchQuery, $options: 'i' } }, 
            { tariffType: { $regex: searchQuery, $options: 'i' } }, 
            { 'taxData.name': { $regex: searchQuery, $options: 'i' } }, 
        ];
    }
   
    const result = await ChargingTariff.aggregate([
        {
            $lookup: {
                from: 'taxes', // The name of the referenced collection (case-sensitive)
                localField: 'tax',
                foreignField: '_id',
                as: 'taxData',
            },
        },
        { $match: filter },
        {
            $unwind: '$taxData',
        },
    ]).skip(10*(pageNo-1)).limit(10);

    let totalCount = await ChargingTariff.find(filter).countDocuments()

    res.status(200).json({ status: true, message: 'OK', result: result, totalCount })
}

const getChargingTariffListDropdown = async (req, res) => {

    const filter = {};
   
    const result = await ChargingTariff.aggregate([
        {
            $lookup: {
                from: 'taxes', // The name of the referenced collection (case-sensitive)
                localField: 'tax',
                foreignField: '_id',
                as: 'taxData',
            },
        },
        { $match: filter },
        {
            $unwind: '$taxData',
        },
    ])

    let totalCount = await ChargingTariff.find(filter).countDocuments()

    res.status(200).json({ status: true, message: 'OK', result: result, totalCount })
}

// get chargingTariff by id
const getChargingTariffById = async (req, res) => {
    const id = req.params.id

    const chargingTariff = await ChargingTariff.findOne(id === 'default' ? { isDefault: true } : { _id: id })
    //    const chargingTariff = await ChargingTariff.findById(id)

   
    if (!chargingTariff) {
        throw new createError(404, `ChargingTariff with id ${id} not found`)
    }

    let taxPercentage = await getTaxPercentage(chargingTariff.tax)

    let total = chargingTariff.serviceAmount + chargingTariff.value
    total += (total * taxPercentage)

    res.status(200).json({ status: true, result: { tax: taxPercentage, total: Number(total.toFixed(2)) } })
}

// get chargingTariff by id
const getTotalChargingTariffRate = async (req, res) => {
    const { id } = req.params

    const chargingTariff = await ChargingTariff.findOne(id === 'default' ? { isDefault: true } : { _id: id })
    if (!chargingTariff) {
        throw new createError(404, `ChargingTariff with id ${id} not found`)
    }

    let taxPercentage = await getTaxPercentage(chargingTariff.tax)
    let total = chargingTariff.serviceAmount + chargingTariff.value
    total += (total / taxPercentage)


    res.status(200).json({ status: true, result: Number(total.toFixed(2)) })
}

// update chargingTariff by id
const updateChargingTariff = async (req, res) => {
    const { error, value } = chargingTariffUpdateValidationSchema.validate(req.body)

    if (error) {
        throw new createError(
            400,
            error.details.map((detail) => detail.message).join(', ')
        );
    }

    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new createError(400, `Invalid id ${id}`)
    }

    const payload = { $set: req.body };

    const chargingTariff = await ChargingTariff.findOne({_id: id}, 'name')
    if (!chargingTariff) throw new createError(404, `ChargingTariff with id ${id} not found`)
    if (chargingTariff.name === "Default" && req.body.hasOwnProperty('name')) delete req.body.name

    const chargingTariffUpdated = await ChargingTariff.findByIdAndUpdate(id, payload, { new: true })

    res.status(200).json(chargingTariffUpdated)
}

// delete chargingTariff by id
const deleteChargingTariff = async (req, res) => {
    const { id } = req.params

    const chargingTariff = await ChargingTariff.findByIdAndDelete(id)
    if (!chargingTariff) {
        throw new createError(404, `ChargingTariff with id ${id} not found`)
    }
    res.status(200).json(chargingTariff)
}



module.exports = {
    createChargingTariff,
    getChargingTariffList,
    getChargingTariffListDropdown,
    getChargingTariffById,
    updateChargingTariff,
    deleteChargingTariff,
    getTotalChargingTariffRate,
    createDefaultChargingTariff,
    getDefaultChargingTariff
}