const express = require('express')
require('dotenv').config()
const cors = require('cors')
const evMachineRoute = require('./routes/evMachineRoutes.js')
const logger = require('morgan')
const errorHandler = require('./middlewares/errorMiddleware.js')
const app = new express()
const cookieParser = require('cookie-parser')
const createError = require('http-errors')
const authVerify = require('./middlewares/authVerify.js')
const evMachineController = require('./controllers/evMachineController')


app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }
))




app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({ extended: true , limit:"20kb" }))
// app.use(express.static("public") only if we have any docss

app.use(cookieParser())

//! DONOT DELETEs
app.get('/api/health-check',((req, res) =>{
  res.status(200).send('connected to ev-machine-service api!!')
}))


// testing dropdown
//main APIs
app.use(logger('dev'))
app.use('/api/v1', authVerify, evMachineRoute)
app.get("/QRCode/:id/:connectorId", evMachineController.getQRCode);

// 404 
app.all('*', (req, res, next) => {
    const err = new createError(
      404,
      `Cant find the ${req.originalUrl} on the ev charging service server !`
    )
    next(err)
  })
// Use the error-handling middleware
app.use(errorHandler)

// Export the Express app for use in the handler.js file
module.exports = app;
