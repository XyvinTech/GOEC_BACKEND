const router = require('express').Router()
const chargingStationController = require('../controllers/chargingStationController')
const asyncHandler = require('../utils/asyncHandler')
const dashboardController = require('../controllers/dashboardController')


//image upload
const multer = require('multer');
const upload = multer({ storage:multer.memoryStorage() });
//CRUD operations
router
  .post('/chargingStations/create', asyncHandler(chargingStationController.createChargingStation))
  .get('/chargingStations/list', asyncHandler(chargingStationController.getChargingStationList))

  .post('/chargingStations/:chargingStationId', asyncHandler(chargingStationController.getChargingStationById))
  .put('/chargingStations/:chargingStationId', asyncHandler(chargingStationController.updateChargingStation))
  .delete('/chargingStations/:chargingStationId', asyncHandler(chargingStationController.deleteChargingStation))

router
  .post('/chargingStations/favorite/list', asyncHandler(chargingStationController.getFavoriteChargingStationList))
  .post('/chargingStations/nearby/list', asyncHandler(chargingStationController.getChargingStationUpdatedList))
  .post('/chargingStations/list/byName', asyncHandler(chargingStationController.getChargingStationListByName))


//dashboard
router
  .get('/chargingStations/dashboard/list', asyncHandler(dashboardController.getChargingStationListForDashboard))
  .get('/chargingStations/dashboard/list/dropdown', asyncHandler(dashboardController.getChargingStationListForDropdown))
  .get('/chargingStations/dashboard/evMachineList', asyncHandler(dashboardController.getChargingStationEvMachineList))
  .get('/chargingStations/dashboard/:chargingStationId', asyncHandler(dashboardController.getChargingStationByIdForDashboard))
.get('/chargingStations/dashboard/evMachineList/:chargingStationId', asyncHandler(dashboardController.getCPIDListByChargingStationForDashboard))

  // Image Upload 
  .post('/image/upload',upload.single('image'), asyncHandler(dashboardController.imageUpload))

module.exports = router
