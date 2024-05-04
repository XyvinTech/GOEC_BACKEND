const express = require('express')
const cors = require('cors')
const logger = require('morgan')
const errorHandler = require('./middlewares/errorMiddleware.js')
const cookieParser = require("cookie-parser")
const app = new express()
const vehicleRoute = require('./routes/vehicleRoutes.js')
const brandRoute = require('./routes/brandRoutes.js')
const createError = require('http-errors')
const authVerify = require('./middlewares/authVerify.js')

require('dotenv').config()

app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }
))




app.use(express.json())
app.use(express.urlencoded({ extended: true  }))
// app.use(express.static("public") only if we have any docs

app.use(cookieParser())

//!DONOT DELETE
app.get('/api/health-check',((req, res) =>{
  res.status(200).send('connected to vehicle-service api!!')
}))

//main API


app.use(logger('dev'))
app.use('/api/v1', authVerify, vehicleRoute)
app.use('/api/v1', authVerify, brandRoute)

// 404 
app.all('*', (req, res, next) => {
    const err = new createError(
      404,
      `Cant find the ${req.originalUrl} on the vehicle service server !`
    )
    next(err)
  })
// Use the error-handling middleware
app.use(errorHandler)

// Export the Express app for use in the handler.js file
module.exports = app;