const createError = require('http-errors')
const LOGS = require('../models/logSchema')
const moment = require('moment-timezone');
const logSchema = require('../validation/logSchema')

exports.getLogs = async (req, res) => {
  const { pageNo, searchQuery } = req.query

  const filter = {}

  if (searchQuery) {
    filter.$or = [{ label: { $regex: searchQuery, $options: 'i' } }]
  }
  const totalCount = await LOGS.find(filter).countDocuments();
  let logData = await LOGS.find(filter)
    .skip(10 * (pageNo - 1))
    .limit(10).sort({ timestamps: -1 }).lean()

    logData = logData.map(doc => {
      doc.timestamp = moment(doc.timestamps).tz("Asia/Kolkata").format("MMM DD YYYY h:mm:ss A");
      return doc;
  });
  if (!logData) {
    res.status(404).json({ error: 'Log not found' })
  } else {
    res.status(200).json({ status: true, message: 'OK', result: logData, totalCount })
  }
}
