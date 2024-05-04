const router = require('express').Router()
const emailController = require('../controllers/emailController')
const appController = require('../controllers/firebaseController')
const smsController = require('../controllers/smsController')
const asyncHandler = require('../utils/asyncHandler')

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
// send mail notification
router.post('/notification/sendMail', asyncHandler(emailController.sendNotification))
router.post('/notification/dashboard/email', upload.single('file'), asyncHandler(emailController.dashboardEmail))
router.post('/notification/sendMailToAdmin', asyncHandler(emailController.sendMailToAdmin))


//push Notification
router.get('/notification/list/:userId', asyncHandler(appController.userNotificationList))
router.post('/notification/dashboard/firebase', asyncHandler(appController.dashboardFirebase))
router.post('/notification/save', asyncHandler(appController.saveNotification))

//sms
router.post('/notification/sendSms', asyncHandler(smsController.sendSms))


module.exports = router
