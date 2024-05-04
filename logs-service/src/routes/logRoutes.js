const router = require('express').Router()
const logsController = require('../controllers/logController')
const asyncHandler = require('../utils/asyncHandler')

// send mail logs
router
  .post('/logs', asyncHandler(logsController.sendLogs))
  .get('/logs', asyncHandler(logsController.getLogs))

module.exports = router
