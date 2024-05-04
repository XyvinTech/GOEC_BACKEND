const createError = require('http-errors')
const USER = require('../models/userSchema')
// @ts-ignore
const { userSchema, userEditSchema } = require('../validation/userSchema')
// @ts-ignore
const { axiosErrorHandler } = require('../utils/axiosErrorHandler');
const axios = require('axios');
const generateToken = require('../utils/generateToken');
require('dotenv').config();

const token = generateToken(process.env.AUTH_SECRET);


// add a rfidTag
exports.addRfidTag = async (req, res) => {
    const rfidServiceUrl = process.env.RFID_SERVICE_URL
    if (!rfidServiceUrl) throw new createError(404, `RFID_SERVICE_URL not set in env file`)
    if (!req.body.rfidTagId) throw new createError(404, `rfidTagId is a required field`)
    const rfidTagId = req.body.rfidTagId
    const rfidType= req.body.rfidType
  
    //find rfid from rfid-service and check if it is valid
    try {

      let apiResponse = await axios.get(`${rfidServiceUrl}/api/v1/rfid/${rfidTagId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
      }
      })
      let rfidTagResult = apiResponse.data
      // @ts-ignore
      if (!rfidTagResult || rfidTagResult.status === false) throw new createError(404, `rfidTagId not found`)
      // @ts-ignore
      let updatetype = await axios.put(`${rfidServiceUrl}/api/v1/rfid/${rfidTagId}`,{status:'assigned'}, {
        headers: {
          Authorization: `Bearer ${token}`,
      }
      })
      // @ts-ignore
      if (!updatetype || updatetype.status === false) throw new createError(404, `rfidTagType cant be updated`)
    }
    catch (error) {
      console.log(error)
      throw new createError(404, `rfidTagId not found`)
    }
  
    //check if rfid already assigned to any user
    const rfidAssigned = await USER.findOne({
      rfidTag: { $elemMatch: { $eq: rfidTagId } }
    });
    // @ts-ignore
    if (rfidAssigned) throw new createError(404, `rfidTagId is already assigned`)
  
    const updatedUser = await USER.findByIdAndUpdate(
      req.params.userId,
      { $push: { rfidTag: rfidTagId } },
      { new: true }
    )
    if (!updatedUser) {
      res.status(404).json({ status: false, message: 'User not found' })
    } else {
      res.status(200).json({ status: true, message: 'Ok', updatedUser })
    }
  }
  

  // remove a rfidTag
exports.removeRfidTag = async (req, res) => {
    const rfidServiceUrl = process.env.RFID_SERVICE_URL
  
    // @ts-ignore
    if (!req.body.rfidTagId) throw new createError(404, `rfidTagId is a required field`)
    const rfidTagId = req.body.rfidTagId
  
    const user = await USER.findById({ _id: req.params.userId, rfidTag: rfidTagId }, 'rfidTag')
    // @ts-ignore
    let rfidTagFound = user.rfidTag.includes(rfidTagId)
    // @ts-ignore
    if (!rfidTagFound) throw new createError(404, `rfidTagId not found in user`)
  
    const updatedUser = await USER.findByIdAndUpdate(
      req.params.userId,
      { $pull: { rfidTag: rfidTagId } },
      { new: true }
    )
     // @ts-ignore
     await axios.put(`${rfidServiceUrl}/api/v1/rfid/${rfidTagId}`,{status:'unassigned'}, {
      headers: {
        Authorization: `Bearer ${token}`,
    }
     })
  
    //! whe unassigned make rfid unassigned
    if (!updatedUser) {
      res.status(404).json({ status: false, message: 'User not found' })
    } else {
      res.status(200).json({ status: true, message: 'Ok', result: updatedUser })
    }
  }
  
  // remove a rfidTag
  exports.removeRfidTagById = async (req, res) => {
    // @ts-ignore
    if (!req.params.rfidTagId) throw new createError(404, `rfidTagId is a required field`)
    const rfidTagId = req.params.rfidTagId
  
    const updatedUser = await USER.updateOne({
      rfidTag: { $elemMatch: { $eq: rfidTagId } }
    }, { $pull: { rfidTag: rfidTagId } });
  
    res.status(200).json(updatedUser && updatedUser.modifiedCount ? { status: true, message: 'Ok' } : { status: false, message: 'Couldn`t update ' })
  }