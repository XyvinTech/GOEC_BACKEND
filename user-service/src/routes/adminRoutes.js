const router = require('express').Router()
const adminController = require('../controllers/adminController')
const authVerify = require('../middlewares/authVerify')
const asyncHandler = require('../utils/asyncHandler')


// Create a new admins and roles
router.post('/admin-signin', asyncHandler(adminController.adminSignIn))

//roles
router.post('/role/create', authVerify, asyncHandler(adminController.createRole))
router.get('/role/list', authVerify, asyncHandler(adminController.getRole))
router.put('/role/:id', authVerify, asyncHandler(adminController.updateRole))
router.delete('/role/:id', authVerify, asyncHandler(adminController.deleteRole))
router.get('/role/:id', authVerify, asyncHandler(adminController.getRoleById))


//admins
router.post('/admin/create', authVerify, asyncHandler(adminController.createAdmin))
router.get('/admin/list', authVerify, asyncHandler(adminController.getAdmin))
router.put('/admin/:id', authVerify, asyncHandler(adminController.updateAdmin))
router.delete('/admin/:id', authVerify, asyncHandler(adminController.deleteAdmin))




router.get('/userList', authVerify, asyncHandler(adminController.userList))
router.get('/userDatabyId/:id', authVerify, asyncHandler(adminController.userDataById))
router.get('/userDatabyPhoneOrEmail', authVerify, asyncHandler(adminController.userDatabyPhoneOrEmail))
router.get('/favoriteStations/:id', authVerify, asyncHandler(adminController.favoriteStations))
router.get('/chargingTariff/:id', authVerify, asyncHandler(adminController.chargingTariff))
router.get('/vehicleDetails/:id', authVerify, asyncHandler(adminController.vehicleDetails))
router.get('/rfidDetails/:id', authVerify, asyncHandler(adminController.rfidDetails))


  //chargingTariff
  .put('/assignUnassignChargingTariff/:userId', authVerify, asyncHandler(adminController.assignUnassignChargingTariff))

  .get('/suggestions', authVerify, asyncHandler(adminController.suggestions))



module.exports = router;