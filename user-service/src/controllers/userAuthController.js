const createError = require('http-errors')
const USER = require('../models/userSchema')

const { signAccessToken } = require('../utils/jwt_helper');
const { generateUniqueAlphanumericString } = require('../utils/generateUniqueUserId')
const { generateOTP } = require('../utils/generateOTP');
const { sendOTPBySMS } = require('../services/notification-service-api');
const { getConfigValue } = require('../services/configuration-service-api');
const { getRFIDMongoId } = require('../services/rfid-service-api');



exports.rfidAuthenticate = async (req, res) => {
    const minimumWalletRequirement = await getConfigValue('minimum-transaction-wallet-requirement')

    // @ts-ignore
    if (!req.params.rfid) throw new createError(400, 'rfid is a required field')
    const rfidSerialNumber = req.params.rfid

    let rfidMongoId = await getRFIDMongoId(rfidSerialNumber)
    // @ts-ignore
    if (!rfidMongoId) throw new createError(400, 'No Mongo Id')

    // @ts-ignore
    if (rfidMongoId.status !== 'assigned') throw new createError(200, 'rfid is not assigned')
    let rfidId = rfidMongoId._id
    //then find the user
    const user = await USER.findOne({ rfidTag: rfidId });
    // @ts-ignore
    if (!user) throw new createError(200, 'rfid not found')

    //if user's wallet amount is less than the minimum amount required for a transaction, throw error
    if (minimumWalletRequirement && !isNaN(minimumWalletRequirement) && user.wallet < minimumWalletRequirement) {
        res.status(200).json({ status: false, message: `Wallet Amount less than minimum wallet amount required ${minimumWalletRequirement}` })
    }
    else {
        res.status(200).json({ status: true, result: user })
    }
}

exports.userAuthenticate = async (req, res) => {
    const minimumWalletRequirement = await getConfigValue('minimum-transaction-wallet-requirement')
    // @ts-ignore
    if (!req.params.userid) throw new createError(400, 'user is a required field')

    const user = await USER.findOne({ userId: req.params.userid }, 'wallet');
    // @ts-ignore
    if (!user) throw new createError(400, 'user not found')

    //if user's wallet amount is less than the minimum amount required for a transaction, throw error
    if (minimumWalletRequirement && !isNaN(minimumWalletRequirement) && user.wallet < minimumWalletRequirement) {
        // throw new createError(400, `Wallet Amount less than minimum wallet amount required ${minimumWalletRequirement}`)
        res.status(200).json({ status: false, message: `Wallet Amount less than minimum wallet amount required ${minimumWalletRequirement}` })
    }
    else {
        res.status(200).json({ status: true, message: 'Ok', result: user })
    }
}

exports.userAuthenticateById = async (req, res) => {
    const minimumWalletRequirement = await getConfigValue('minimum-transaction-wallet-requirement')
    // @ts-ignore
    if (!req.params.userId) throw new createError(400, 'user is a required field')

    const user = await USER.findOne({ _id: req.params.userId }, 'wallet');
    // @ts-ignore
    if (!user) throw new createError(400, 'user not found')

    if (minimumWalletRequirement && !isNaN(minimumWalletRequirement) && user.wallet < minimumWalletRequirement) {
        res.status(200).json({ status: false, message: `Wallet Amount less than minimum wallet amount required ${minimumWalletRequirement}` })
    }
    else {
        res.status(200).json({ status: true, message: 'Ok', result: user })
    }
}



// sendOtp
exports.sendOtp = async (req, res) => {

    const otp = generateOTP(5)
    const mobileNo = req.params.mobileNo

    const countryCode = '+91' // Country code for India
    const withoutCountryCode = mobileNo.slice(countryCode.length);
    let user = await USER.findOne({ mobile: { $in: [mobileNo, withoutCountryCode] } }, '_id')
    if (!user) {
        //! check if indian user or not
        if (mobileNo.startsWith(countryCode)) {
            user = new USER({
                mobile: mobileNo,
                otp: otp
            });
        }else{
            user = new USER({
                mobile: mobileNo,
                otp: otp,
                wallet: 2000
            });
        }
        await user.save();
    }
    else {
        await USER.updateOne( { mobile: { $in: [mobileNo, withoutCountryCode] } }, {
            $set: {
                otp: otp,
                mobile: mobileNo
            }
        })


    }


    await sendOTPBySMS(mobileNo, otp)



    res.status(200).json({
        status: true,
        message: 'Otp send successfully',
        otp,
    })
}

// login api
exports.login = async (req, res) => {
    const mobileNo = req.params.mobileNo
    const otp = req.body.otp

    const user = await USER.findOne({ mobile: mobileNo }, '_id otp username email')

    if (!user) return res.status(404).json({ status: false, message: 'User not found' })
    if (user.otp != otp) return res.status(404).json({ status: false, message: 'Invalid Otp' })

    let userId = await generateUniqueAlphanumericString(10);

    await USER.updateOne({ mobile: mobileNo }, {
        $set: {
            otp: null,
            userId: userId,
            firebaseToken: req.body.firebaseToken
        }
    })

    

    let token = await signAccessToken(user._id.toString(), 'user', user.email || "")

    res.status(200).json({
        status: true,
        message: 'Ok',
        result: { token, username: mobileNo },
    })
}


exports.firebaseId = async (req, res) => {

    // @ts-ignore
    if (!req.params.userId) throw new createError(400, 'userId is a must')

    const user = await USER.findOne({ _id: req.params.userId })
    if (!user) res.status(404).json({ status: false, message: 'User not found' })
    // @ts-ignore
    const firebaseId = user.firebaseToken
    res.status(200).json({ status: true, message: 'Ok', result: firebaseId })


}


exports.updateFirebaseId = async (req, res) => {

    // @ts-ignore
    if (!req.params.userId) throw new createError(400, 'userId is a must')
    const { userId } = req.params;
    const { firebaseToken } = req.body;

    if (!userId) {
        // @ts-ignore
        throw new createError(400, 'userId is a must');
    }
    if (!firebaseToken) {
        // @ts-ignore
        throw new createError(400, 'firebaseToken is required');
    }

    const updatedUser = await USER.findByIdAndUpdate(
        userId,
        { $set: { firebaseToken: firebaseToken } },
        { new: true } // Return the updated document
    );

    if (!updatedUser) {
        // @ts-ignore
        throw new createError(404, 'User not found');
    }
    res.status(200).json({ status: true, message: 'Ok', result: {} })
}