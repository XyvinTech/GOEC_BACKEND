const router = require('express').Router()
const evMachineController = require('../controllers/evMachineController')
const asyncHandler = require('../utils/asyncHandler')
const { createOEM, getOEM, updateOEM, deleteOEM, getOEMs, getOEMsDropdown } = require("../controllers/oemController")
const { createEvModel, getEvModel, updateEvModel, deleteEvModel, getEvModels, getEvModelsDropdown } = require("../controllers/evModelController")
const { getDashboardList, getDashboardListById, getTariff, ChangeTariff, getReport, getReport2 } = require('../controllers/dashbaordController')

//CRUD operations
router
  .post('/evMachine/create', asyncHandler(evMachineController.createEvMachine))
  .get('/evMachine/list', asyncHandler(evMachineController.getEvMachineList))
  .get('/evMachine/:evMachineId', asyncHandler(evMachineController.getEvMachineById))
  .get('/evMachine/evMachineCPID/:evMachineCPID', asyncHandler(evMachineController.getEvMachineByCPID))
  .put('/evMachine/:evMachineId', asyncHandler(evMachineController.updateEvMachine))
  .delete('/evMachine/:evMachineId', asyncHandler(evMachineController.deleteEvMachine))
  .get('/evMachine/getChargingTariff/:evMachineCPID', asyncHandler(evMachineController.getEvMachineTariffRate))
  .delete('/evMachineByStationId/:evMachineId', asyncHandler(evMachineController.deleteEvMachineByStationId))

router
  .put('/evMachine/addConnector/:evMachineId', asyncHandler(evMachineController.addConnector))
  .put('/evMachine/removeConnector/:evMachineId', asyncHandler(evMachineController.removeConnector))

router
  .post('/evMachine/updateStatusConnector/:evMachineCPID', asyncHandler(evMachineController.updateStatusConnector))
  .post('/evMachine/updateStatusCPID/:evMachineCPID', asyncHandler(evMachineController.updateStatusCPID))


//OEM
router.post("/oem/create", asyncHandler(createOEM))
router.get("/oem/list", asyncHandler(getOEMs))
router.get("/oem/list/dropdown", asyncHandler(getOEMsDropdown))
router.put("/oem/:id", asyncHandler(updateOEM))
router.get("/oem/:id", asyncHandler(getOEM))
router.delete("/oem/:id", asyncHandler(deleteOEM))



//EV model
router.post("/evModel/create", asyncHandler(createEvModel))
router.get("/evModel/list", asyncHandler(getEvModels))
router.get("/evModel/list/dropdown", asyncHandler(getEvModelsDropdown))
router.put("/evModel/:id", asyncHandler(updateEvModel))
router.delete("/evModel/:id", asyncHandler(deleteEvModel))
router.get("/evModel/:id", asyncHandler(getEvModel))

//Dashboard
router.get("/evMachine/dashboard/list", asyncHandler(getDashboardList))
router.get("/evMachine/dashboard/tariffDetails/:cpid", asyncHandler(getTariff))
router.post("/evMachine/dashboard/changeTariff/:cpid", asyncHandler(ChangeTariff))
router.get("/evMachine/dashboard/:id", asyncHandler(getDashboardListById))
// router.get("/evMachine/getCount",asyncHandler(getCountForDashBoard))
router.get("/evMachine/dashboard/report/2", asyncHandler(getReport2))


router.post("/evMachine/dashboardReport/report", asyncHandler(getReport))

router.post("/evMachine/CPID", asyncHandler(evMachineController.getEvByLocation))

module.exports = router
