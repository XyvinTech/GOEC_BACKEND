const router = require('express').Router()
const { createRfid, getRfids, getRfid, updateRfid,getUnassignedRfids, deleteRfid,createManyRfid,getRfidBySerialNumber } = require("../controllers/rfidController")
const asyncHandler = require("../utils/asyncHandler")


// create rfid
router.post('/rfid/create', asyncHandler(createRfid))
// create rfid
router.post('/rfid/createMany',asyncHandler(createManyRfid))

// get all rfids
router.get('/rfid/list', asyncHandler(getRfids))
router.get('/rfid/unassignedList', asyncHandler(getUnassignedRfids))


// get rfid by id
router.get('/rfid/:id', asyncHandler(getRfid))

// get rfid by serial number
router.get('/rfid/rfidbySerialNumber/:rfidSerialNumber', asyncHandler(getRfidBySerialNumber))

// update rfid
router.put('/rfid/:id', asyncHandler(updateRfid))

// delete rfid
router.delete('/rfid/:id', asyncHandler(deleteRfid))


module.exports = router