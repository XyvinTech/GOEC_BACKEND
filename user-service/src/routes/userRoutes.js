const router = require('express').Router()
const userController = require('../controllers/userController')
const userCRUDController = require('../controllers/userBasicCRUDControllers')
const userRFIDController = require('../controllers/userRFIDController')
const userVehicleController = require('../controllers/userVehicleController')
const userAuthController = require('../controllers/userAuthController')
const userStationController = require('../controllers/userStationController')


const asyncHandler = require('../utils/asyncHandler')
//image upload
const multer = require('multer');
const authVerify = require('../middlewares/authVerify')
const upload = multer({ storage: multer.memoryStorage() });


//!user basic CRUD controller
router
  .post('/users/user', asyncHandler(userCRUDController.createUser))
  .get('/users/list', authVerify, asyncHandler(userCRUDController.getUserList))
  .get('/users/user/:userId', authVerify, asyncHandler(userCRUDController.getUserById))
  .put('/users/:userId', authVerify, asyncHandler(userCRUDController.updateUser))
  .post('/image/upload', upload.single('image'), asyncHandler(userCRUDController.imageUpload))
  .delete('/users/:userId', authVerify, asyncHandler(userCRUDController.deleteUser))
  .get('/users/user/byMobileNo/:mobileNo', authVerify, asyncHandler(userCRUDController.getUserByMobileNo))
  .put('/users/update/byMobileNo/:mobileNo', authVerify, asyncHandler(userCRUDController.updateUserByMobileNo))


//!user Auth related

router
  .get('/users/sendOtp/:mobileNo', asyncHandler(userAuthController.sendOtp))
  .put('/users/login/:mobileNo', asyncHandler(userAuthController.login))
  .get('/users/transaction/rfid-authenticate/:rfid', authVerify, asyncHandler(userAuthController.rfidAuthenticate))
  .get('/users/transaction/authenticate/:userid', authVerify, asyncHandler(userAuthController.userAuthenticate))
  .get('/users/transaction/authenticate/byId/:userId', authVerify, asyncHandler(userAuthController.userAuthenticateById))
  .get('/users/getFirebaseId/:userId', authVerify, asyncHandler(userAuthController.firebaseId))
  .put('/users/updateFirebaseId/:userId', authVerify, asyncHandler(userAuthController.updateFirebaseId))




//!add and delete favorites
router
  .put('/users/addFavoriteStation/:userId', authVerify, asyncHandler(userStationController.addFavoriteStation))
  .put('/users/removeFavoriteStation/:userId', authVerify, asyncHandler(userStationController.removeFavoriteStation))



//!vehicle related
router
  .put('/users/addVehicle/:userId', authVerify, asyncHandler(userVehicleController.addVehicle))
  .put('/users/removeVehicle/:userId', authVerify, asyncHandler(userVehicleController.removeVehicle))
  .get('/users/vehicleList/:userId', authVerify, asyncHandler(userVehicleController.getUserVehicles))
  .put('/users/updateDefaultVehicle/:userId', authVerify, asyncHandler(userVehicleController.updateUserDefaultVehicle))


//! rfidTag related
router
  .put('/users/addRfidTag/:userId', authVerify, asyncHandler(userRFIDController.addRfidTag))
  .put('/users/removeRfidTag/:userId', authVerify, asyncHandler(userRFIDController.removeRfidTag))
  .put('/users/removeRfidTagById/:rfidTagId', authVerify, asyncHandler(userRFIDController.removeRfidTagById))

//!Wallet
router
  .put('/users/addToWallet/:userId', authVerify, asyncHandler(userController.addToWallet))
  .put('/users/deductFromWallet/:userId', authVerify, asyncHandler(userController.deductFromWallet))

router
  .put('/users/transaction/increaseSessions', authVerify, asyncHandler(userController.userUpdateSession))
  .get('/users/getChargingTariff/fromRfid/:rfId', authVerify, asyncHandler(userController.getChargingTariffByRfid))





module.exports = router
