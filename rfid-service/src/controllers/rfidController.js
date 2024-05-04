const rfidValidationSchema = require("../validation/rfidValidationSchema")
const Rfid = require("../models/rfidTagSchema")
const mongoose = require('mongoose');
const createError = require("http-errors")
const axios = require('axios');
require('dotenv').config();
const moment = require('moment');
const generateToken = require('../utils/generateToken');
const token = generateToken(process.env.AUTH_SECRET);

// create rfid
const createRfid = async (req, res) => {

    let data = req.body
 data.expiry = moment( data.expiry, 'DD-MM-YYYY');
 data.status = data.status==='active'?'unassigned':'inactive';
    const rfid = new Rfid(data)
    const savedRfid = await rfid.save()
    res.status(201).json({ status: true, message: 'OK', result: savedRfid })
}



const createManyRfid = async (req, res) => {


    const data = req.body
    // if (!req.file) {
    //     return res.status(400).json({ status: false, error: 'No file uploaded' });
    // }

    // const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    // const sheetName = workbook.SheetNames[0];
    // const worksheet = workbook.Sheets[sheetName];
    // const data = xlsx.utils.sheet_to_json(worksheet);


    await Rfid.insertMany(data.data)
    res.status(201).json({ status: true, message: 'OK' })
}


// get all rfid with
const getRfids = async (req, res) => {
    // const rfids = await Rfid.find({}).populate('user','name email')
    // const rfids = await Rfid.find({})

    const {  pageNo } = req.query;

    const pipeline = await Rfid.aggregate([
        { $sort: { updatedAt: -1 } },

        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "rfidTag",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            wallet: 1,
                        }
                    }
                ],
                as: "userDetails",
            }
        },
        {
            $unwind: {
                path: '$userDetails',
                preserveNullAndEmptyArrays: true
            }
        },        {
            $project: {
                _id: 1,
                serialNumber: 1,
                status: 1,
                expiry: 1,
                rfidTag:1,
                createdAt: 1,
                username: '$userDetails.username',
                balance: '$userDetails.wallet'

            }
        }    
   ]).skip(10*(pageNo-1)).limit(10);

   let totalCount = await Rfid.countDocuments()

   let result= pipeline.map(data=>{
    return{
        _id: data._id,
        serialNumber: data.serialNumber,
        status: data.status,
        rfidTag:data.rfidTag,
        expiry: moment(data.expiry).format('DD-MM-YYYY'),
        createdAt: moment(data.createdAt).format('DD-MM-YYYY'),
        username: data.username,
        balance: data.balance?.toFixed(2)
    }
   })


res.status(200).json({ status: true, message: 'OK', result: result, totalCount })
}

// get rfid by id
const getRfid = async (req, res) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new createError(400, `Invalid id ${id}`)
    }

    const rfid = await Rfid.findById(id)
    if (!rfid) {
        throw new createError(400, `Rfid with id ${id} not found`)
    }
    res.status(200).json({ status: true, message: 'OK', result: rfid })
}

const getUnassignedRfids = async (req, res) => {
    

    

    const rfid = await Rfid.find({ status: { $in: ['unassigned', 'active'] } })
 
    res.status(200).json({ status: true, message: 'OK', result: rfid })
}

// get rfid by id
const getRfidBySerialNumber = async (req, res) => {
    const serialNo = req.params.rfidSerialNumber

    if (!serialNo) {
        throw new createError(400, `serialNo is empty`)
    }

    const rfid = await Rfid.findOne({ serialNumber: serialNo })
    if (!rfid) {
        throw new createError(400, `Rfid with serialNo ${serialNo} not found`)
    }
    res.status(200).send({ status: true, rfid: rfid })
}

// update rfid by id
const updateRfid = async (req, res) => {
    const { id } = req.params
    const data = req.body
   if(data.expiry) {data.expiry = moment( data.expiry, 'DD-MM-YYYY');}
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new createError(400, `Invalid id ${id}`)
    }
  
    const payload = { $set: data };

    const rfid = await Rfid.findByIdAndUpdate(id, payload, { new: true })
    if (!rfid) {
        throw new createError(404, `Rfid with id ${id} not found`)
    }
    res.status(200).json({ status: true, message: 'OK', result: rfid })
}

// delete rfid by id
const deleteRfid = async (req, res) => {
    const { id } = req.params

    const userServiceUrl = process.env.USER_SERVICE_URL
    if (!userServiceUrl) throw new createError(404, `USER_SERVICE_URL not set in .env`)

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new createError(400, `Invalid id ${id}`)
    }

    // code to check and delete rfid from user db
    try {
        await axios.put(`${userServiceUrl}/api/v1/users/removeRfidTagById/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })

    } catch (error) {
        throw new createError(400, `no rfid with user`)
    }

    const rfid = await Rfid.findByIdAndDelete(id)
    if (!rfid) {
        throw new createError(404, `Rfid with id ${id} not found`)
    }
    res.status(200).json({ status: true, message: 'Deleted !' })
}



module.exports = {
    createRfid,
    getRfids,
    getRfid,
    updateRfid,
    deleteRfid,
    getRfidBySerialNumber,
    createManyRfid,
    getUnassignedRfids
}