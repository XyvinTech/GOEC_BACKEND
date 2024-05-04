const router = require('express').Router()
const { createBrand, getAllBrands, updateBrandById, deleteBrandById, getAllBrandsDropdown } = require('../controllers/brandController')
const asyncHandler = require("../utils/asyncHandler")


router
    .post("/brand/create", asyncHandler(createBrand))
    .get("/brand/list", asyncHandler(getAllBrands))
    .get("/brand/list/dropdown", asyncHandler(getAllBrandsDropdown))
    .put("/brand/:id", asyncHandler(updateBrandById))
    .delete("/brand/:id", asyncHandler(deleteBrandById))


module.exports = router
