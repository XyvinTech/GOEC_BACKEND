const router = require('express').Router()
const { createOEM, getOEM, updateOEM, deleteOEM, getOEMs, getConfigByName, addConfigValue, getConfigList} = require("../controllers/configurationController")
const { createTax, getTaxById, updateTax, deleteTax, getTaxList, getTaxListDropdown } = require("../controllers/taxController")
const { createChargingTariff,getDefaultChargingTariff, createDefaultChargingTariff, getChargingTariffById, updateChargingTariff, deleteChargingTariff, getChargingTariffList, getTotalChargingTariffRate, getChargingTariffListDropdown } = require("../controllers/chargingTariffController")
const asyncHandler = require("../utils/asyncHandler")



// tax - routes
router
    .post("/config/create", asyncHandler(addConfigValue))
    .get("/config/list", asyncHandler(getConfigList))
    .get("/config/byName/:name", asyncHandler(getConfigByName))

// tax - routes
router
    .post("/tax/create", asyncHandler(createTax))
    .get("/tax/list", asyncHandler(getTaxList))
    .get("/tax/list/dropdown", asyncHandler(getTaxListDropdown))
    .get("/tax/:id", asyncHandler(getTaxById))
    .delete("/tax/:id", asyncHandler(deleteTax))
    .put("/tax/:id", asyncHandler(updateTax))

// chargingTariff - routes
router
    .post("/chargingTariff/create", asyncHandler(createChargingTariff))
    .post("/chargingTariff/createUpdate/default", asyncHandler(createDefaultChargingTariff))
    .get("/chargingTariff/list", asyncHandler(getChargingTariffList))
    .get("/chargingTariff/list/dropdown", asyncHandler(getChargingTariffListDropdown))
    .get("/chargingTariff/default", asyncHandler(getDefaultChargingTariff))

    .get("/chargingTariff/:id", asyncHandler(getChargingTariffById))
    .get("/chargingTariff/getTotalRate/:id", asyncHandler(getTotalChargingTariffRate)) //pass 'default' or charginTariff id
    .delete("/chargingTariff/:id", asyncHandler(deleteChargingTariff))
    .put("/chargingTariff/:id", asyncHandler(updateChargingTariff))


module.exports = router