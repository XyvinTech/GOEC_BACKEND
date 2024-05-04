const mongoose = require('mongoose')

const logSchema = new mongoose.Schema({
  level: {
    type: String,
  },
  message: {
    type: String,
  },
  label: {
    type: String,
  },
  timestamps: {
    type: Date,
    default: Date.now, 
    index: { expires: '5d' } 
  },
})

const Log = mongoose.model('errorLog', logSchema)

module.exports = Log
