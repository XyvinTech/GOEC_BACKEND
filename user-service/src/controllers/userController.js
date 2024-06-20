const createError = require('http-errors')
const USER = require('../models/userSchema')
const axios = require('axios');
const { getRFIDMongoId } = require('../services/rfid-service-api');
const { getConfigValue } = require('../services/configuration-service-api');
const moment = require('moment')

// @ts-ignore
// @ts-ignore
const { axiosErrorHandler } = require('../utils/axiosErrorHandler');
const { updateWalletTransaction } = require('../services/transaction-service-api');
const generateToken = require('../utils/generateToken');
require('dotenv').config();


const token = generateToken(process.env.AUTH_SECRET);


// Get charging tariff by ID
exports.getChargingTariffByRfid = async (req, res) => {
  const idOrRfid = req.params.rfId
  let chargingTariffApiResult = {}

  const configurationServiceUrl = process.env.CONFIG_SERVICE_URL
  if (!configurationServiceUrl) return res.status(400).json({ status: false, message: 'CONFIG_SERVICE_URL not set in env' })

  if (idOrRfid.length == 10) {
    const user = await USER.findOne({ userId: idOrRfid }, 'chargingTariff')

    // @ts-ignore
    if (user.chargingTariff) {
      // @ts-ignore
      let apiResponse = await axios.get(`${configurationServiceUrl}/api/v1/chargingTariff/${user.chargingTariff}`, {
        headers: {
          Authorization: `Bearer ${token}`,
      }
      })
      chargingTariffApiResult = apiResponse.data.result
    }

    // @ts-ignore
    res.status(200).json({ status: true, message: 'Ok', result: { _id: user._id, chargingTariffTotal: chargingTariffApiResult.total, tax: chargingTariffApiResult.tax } })
  }
  else {
    let rfidMongoId = await getRFIDMongoId(idOrRfid)
    // @ts-ignore
    if (!rfidMongoId) throw new createError(400, 'No Mongo Id')

    let rfidId = rfidMongoId._id
    //then find the user
    const user = await USER.findOne({ rfidTag: rfidId }, 'chargingTariff');
    // @ts-ignore
    if (!user) throw new createError(400, 'rfid not found')

    if (user.chargingTariff) {
      // @ts-ignore
      let apiResponse = await axios.get(`${configurationServiceUrl}/api/v1/chargingTariff/${user.chargingTariff}`, {
        headers: {
          Authorization: `Bearer ${token}`,
      }
      })
      chargingTariffApiResult = apiResponse.data.result
    }

    res.status(200).json({ status: true, message: 'Ok', result: { _id: user._id, chargingTariffTotal: chargingTariffApiResult.total, tax: chargingTariffApiResult.tax } })
  }
}



// add a favorite station



// add money to wallet
exports.addToWallet = async (req, res) => {
  // @ts-ignore
  if (!req.body.amount) throw new createError(404, `amount is a required field`)
  // @ts-ignore
  else if (isNaN(req.body.amount) || req.body.amount == 0) throw new createError(404, `invalid amount`)

  const user = req.params.userId
  const amount = req.body.amount
  const doneByAdmin = req.body.doneByAdmin
  const reference = req.body.reference
  const actionType = req.body.type

  const updatedUser = await USER.findByIdAndUpdate(
    user,
    { $inc: { wallet: amount } },
    { new: true }
  )
  if (!updatedUser) {
    res.status(404).json({ status: false, message: 'User not found' })
  } else {
    if (doneByAdmin) {
      updateWalletTransaction(user, amount, reference, actionType)
    }

    res.status(200).json({ status: true, message: 'Ok', result: updatedUser })
  }
}

// deduct money from wallet
exports.deductFromWallet = async (req, res) => {
  const minimumWalletRequirement = await getConfigValue('minimum-wallet-requirement')

  // @ts-ignore
  if (!req.body.amount) throw new createError(404, `amount is a required field`)
  // @ts-ignore
  else if (isNaN(req.body.amount) || req.body.amount <= 0) throw new createError(404, `invalid amount`)

  const userId = req.params.userId
  const amount = req.body.amount
  const unitsUsed = req.body.unitsUsed
  const doneByAdmin = req.body.doneByAdmin
  const reference = req.body.reference

  const user = await USER.findById(userId, 'wallet')
  if (!user) res.status(404).json({ status: false, message: 'User not found' })

  // @ts-ignore
  let walletAmount = user.wallet
  // console.log("to change amount ", amount, " user's wallet ", walletAmount, (Number(amount) + Number(minimumWalletRequirement)))
  // if (walletAmount < amount) throw new createError(404, `amount exceeds remaining wallet amount`)
  // @ts-ignore
  if (walletAmount < (Number(amount) + Number(minimumWalletRequirement))) throw new createError(404, `amount exceeds remaining wallet amount`)

  let newWalletAmount = walletAmount - amount
  let updateBody = {
    $set: { wallet: newWalletAmount }
  }
  if (unitsUsed) updateBody["$inc"] = { total_units: unitsUsed }

  const updatedUser = await USER.findByIdAndUpdate(
    userId,
    updateBody,
    { new: true }
  )

  if (doneByAdmin && updatedUser) {
    updateWalletTransaction(user, amount, reference, "admin deduction")
  }

  // @ts-ignore
  res.status(200).json({ status: true, message: 'Ok', result: { walletAmount: updatedUser.wallet } })
}









// Update a user sessions and units
exports.userUpdateSession = async (req, res) => {

  // @ts-ignore
  const { userId, unitsConsumed } = req.body

  const updatedUser = await USER.findByIdAndUpdate(
    userId,
    {
      $inc: {
        // total_units: unitsConsumed,
        total_sessions: 1
      }
    },
    { new: true }

  )
  if (!updatedUser) {
    res.status(404).json({ status: false, message: 'User not found' })
  } else {
    res.status(200).json({ status: true, message: 'Ok', result: updatedUser })
  }
}

exports.userRegReport = async (req, res) => {

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

  let result = await USER.find(filters).sort({createdAt: -1})

  result = result.map(user => {

    return {
      date: moment(user.createdAt).format("DD/MM/YYYY HH:mm:ss"),
      idTag: user._id,
      username: user.username,
      mobile: user.mobile
    }
  })

  const headers = [
    { header: "Date", key: "date" },
    { header: "IdTag", key: "idTag" },
    { header: "User Name", key: "username" },
    { header: "User Mobile Number", key: "mobile" },
  ]

  res.status(200).json({ status: true, message: 'OK', result: { headers: headers, body: result } })

}