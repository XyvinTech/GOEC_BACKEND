const createError = require('http-errors')
const LOGS = require('../models/logSchema')
const logSchema = require('../validation/logSchema')

exports.getLogs= async (req, res) =>{
  const logData = await LOGS.find({})
    if (!logData) {
    res.status(404).json({ error: 'Log not found' })
  } else {
    res.status(200).json(logData)
  }
}

