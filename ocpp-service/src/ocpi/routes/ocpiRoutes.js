const express = require('express');
const router = express.Router();
const locationController = require('./controllers/locationController');
// const sessionController = require('./controllers/sessionController');
// const commandController = require('./controllers/commandController');
const asyncHandler = require('../../utils/asyncHandler');


//Just like razorpay, we have to create a uuid apiSecret with apiuser and attach it via headers group..
//we create a middle ware to confirm its validity via db.
const authenticateOCPIToken=(req,res,next)=>{    
    const token = req.headers['authorization'];
    const ocpiToken = token.split(' ')[1];    
    next()}


//! every resposne ,must be pagenated refer page no:19 ocp1-2-2-1.pdf

router.get('/ocpi/2.2/locations',authenticateOCPIToken, locationController.getLocations);
router.get('/ocpi/2.2/locations/:id',authenticateOCPIToken, locationController.getLocations);


//sessions
//?Similiar to our ocpp transaction
router.get('/ocpi/2.2/sessions',authenticateOCPIToken, locationController.getLocations);
router.get('/ocpi/2.2/sessions/:sessionId',authenticateOCPIToken, locationController.getLocations);
router.post('/ocpi/2.2/sessions', asyncHandler(remoteControllers.remoteStartTransaction))
//similiar to remotestart remote stop
router.post('/ocpi/2.2/commands/START_SESSION', asyncHandler(remoteControllers.remoteStartTransaction))
router.post('/ocpi/2.2/commands/STOP_SESSION', asyncHandler(remoteControllers.remoteStartTransaction))




module.exports = router;