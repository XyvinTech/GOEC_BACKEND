const router = require('express').Router()
const { createVehicle,getAllVehiclesForDashboard, getAllVehicles, getVehicleById, updateVehicleById, deleteVehicleById, getVehiclesByIds,imageUpload, imageUploadAlone } = require('../controllers/vehicleController')
const asyncHandler = require("../utils/asyncHandler")


//image upload
const multer = require('multer');
const upload = multer({ storage:multer.memoryStorage() });

router.post("/image/upload", upload.single('image'),asyncHandler(imageUploadAlone))

// create a new vechicl
router.post("/vehicle/create", asyncHandler(createVehicle))

// get all vechicles
router.get("/vehicle/list", asyncHandler(getAllVehicles))
router.get("/vehicle/dashboard/list", asyncHandler(getAllVehiclesForDashboard))

// get a vechicle by id
router.get("/vehicle/:id", asyncHandler(getVehicleById))
router.post("/vehicle/getByIds", asyncHandler(getVehiclesByIds))

// update a vechicle by id
router.put("/vehicle/:id", asyncHandler(updateVehicleById))

// delete a vechicle by id
router.delete("/vehicle/:id", asyncHandler(deleteVehicleById))

//image



module.exports = router
