// @ts-ignore
const createError = require('http-errors')
const USER = require('../models/userSchema')
// @ts-ignore
const { userSchema, userEditSchema } = require('../validation/userSchema')
const axios = require('axios')
require('dotenv').config();
const AWS = require('aws-sdk');
const { axiosErrorHandler } = require('../utils/axiosErrorHandler');
const generateToken = require('../utils/generateToken');

AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3();

const token = generateToken(process.env.AUTH_SECRET);



exports.createUser = async (req, res) => {


    const user = new USER(req.body)
    const savedUser = await user.save()
    res.status(201).json({ status: true, message: 'Ok', result: savedUser })
}

// Get a user by ID
exports.getUserById = async (req, res) => {
    // 'username email mobile wallet rfidTag bookings favoriteStations vehicle createdAt updatedAt'
    const user = await USER.findById(req.params.userId)
    if (!user) {
        res.status(404).json({ status: false, message: 'User not found' })
    } else {
        res.status(200).json({ status: true, message: 'Ok', result: user })
    }
}


// Get a user list
// @ts-ignore
// @ts-ignore
exports.getUserList = async (req, res) => {
    // 'username email mobile wallet rfidTag bookings favoriteStations vehicle createdAt updatedAt'
    const user = await USER.find({})
    if (!user) {
        res.status(404).json({ status: false, message: 'User not found' })
    } else {
        res.status(200).json({ status: true, message: 'Ok', result: user })
    }
}


// Update a user by ID
exports.updateUser = async (req, res) => {


    const updatedUser = await USER.findByIdAndUpdate(
        req.params.userId,
        { $set: req.body },
        { new: true }
    )
    if (!updatedUser) {
        res.status(404).json({ status: false, message: 'User not found' })
    } else {
        res.status(200).json({ status: true, message: 'Ok', result: updatedUser })
    }
}

exports.updateUserByMobileNo = async (req, res) => {


    const vehicleServiceUrl = process.env.VEHICLE_SERVICE_URL
    if (!vehicleServiceUrl) return res.status(400).json({ status: false, message: 'VEHICLE_SERVICE_URL not set in env' })

    let updatedUser = await USER.findOneAndUpdate(
        { mobile: req.params.mobileNo },
        { $set: req.body },
        { new: true }
    )


    const user = await USER.findOne({ mobile: updatedUser.mobile })


    const defaultVehicle = user?.vehicle.find(vehicle => vehicle.evRegNumber === user.defaultVehicle)
    const userData = user.toObject()


    userData.name = userData.username
    userData.username = userData.mobile
    userData.email = userData.email || ""

    let pipeline = await USER.aggregate([
        { $match: { mobile: req.params.mobileNo } },
        {
            $lookup: {
                from: "rfidtags",
                localField: "rfidTag",
                foreignField: "_id",
                as: "rfidDetails"
            }
        }
    ])

    userData.rfidTag = pipeline[0]?.rfidDetails ? pipeline[0].rfidDetails.map(data => data?.serialNumber) : []
    console.log("🚀 ~ exports.updateUserByMobileNo= ~ defaultVehicle:", defaultVehicle)

    if (defaultVehicle) {
        let apiResponse, vehicleResult;
        try {
            // @ts-ignore

            apiResponse = await axios.get(`${vehicleServiceUrl}/api/v1/vehicle/${defaultVehicle.vehicleRef}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            vehicleResult = apiResponse.data.result

        } catch (error) {
            // @ts-ignore
            axiosErrorHandler(error)
        }


        userData.defaultVehicle = {
            // @ts-ignore
            ...defaultVehicle.toObject(),
            brand: vehicleResult ? vehicleResult.brand : "",
            icon: vehicleResult ? vehicleResult.icon : "",
            modelName: vehicleResult ? vehicleResult.modelName : "",
        }
    }
    else userData.defaultVehicle = null

    if (!updatedUser) {
        res.status(200).json({ status: false, message: 'Ok', result: 'error' })
    } else {
        res.status(200).json({ status: true, message: 'Ok', result: userData })
    }
}



exports.getUserByMobileNo = async (req, res) => {
    const vehicleServiceUrl = process.env.VEHICLE_SERVICE_URL
    if (!vehicleServiceUrl) return res.status(400).json({ status: false, message: 'VEHICLE_SERVICE_URL not set in env' })

    // 'username email mobile wallet rfidTag bookings favoriteStations vehicle createdAt updatedAt'
    const user = await USER.findOne({ mobile: req.params.mobileNo })
    if (!user) return res.status(400).json({ status: false, message: 'User not found' })

    const defaultVehicle = user.vehicle.find(vehicle => vehicle.evRegNumber === user.defaultVehicle)
    const userData = user.toObject()

    // @ts-ignore
    userData.name = userData.username
    userData.username = userData.mobile
    userData.email = userData.email || ""


    let pipeline = await USER.aggregate([
        { $match: { mobile: req.params.mobileNo } },
        {
            $lookup: {
                from: "rfidtags",
                localField: "rfidTag",
                foreignField: "_id",
                as: "rfidDetails"
            }
        }
    ])



    // @ts-ignore
    userData.rfidTag = pipeline[0].rfidDetails ? pipeline[0].rfidDetails.map(data => data.serialNumber) : []
// @ts-ignore
    // @ts-ignore
    if (defaultVehicle) {
        let apiResponse, vehicleResult;
        try {
            // @ts-ignore

            apiResponse = await axios.get(`${vehicleServiceUrl}/api/v1/vehicle/${defaultVehicle.vehicleRef}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            vehicleResult = apiResponse.data.result

        } catch (error) {
            // @ts-ignore
            axiosErrorHandler(error)
        }


        userData.defaultVehicle = {
            // @ts-ignore
            ...defaultVehicle.toObject(),
            brand: vehicleResult ? vehicleResult.brand : "",
            icon: vehicleResult ? vehicleResult.icon : "",
            modelName: vehicleResult ? vehicleResult.modelName : "",
        }
    }
    else userData.defaultVehicle = null

    res.status(200).json({ status: true, message: 'Ok', result: userData })
}


// Delete a user by ID
exports.deleteUser = async (req, res) => {
    const deletedUser = await USER.findByIdAndDelete(req.params.userId)
    if (!deletedUser) {
        res.status(404).json({ status: false, message: 'User not found' })
    } else {
        res.status(200).json({ status: true, message: 'Ok' })
    }
}


exports.imageUpload = async (req, res) => {


    const file = req.file;
    if (!file) return res.status(400).send('No file uploaded.');

    // Create a stream to S3
    const params = {
        Bucket: 'image-upload-oxium/users',
        Key: file.originalname,
        ContentType: file.mimetype,
        Body: file.buffer,
        // ACL: 'public-read' // or another ACL setting
    };

    s3.upload(params, (err, data) => {
        if (err) {
            return res.status(500).send(err);
        }


        // Send back the URL of the uploaded file
        res.send({ status: true, message: 'OK', url: data.Location });
    });


}
