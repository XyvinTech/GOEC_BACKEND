const express = require('express')
const cors = require('cors')
const paymentRoute = require('./routes/paymentRoutes.js')
const logger = require('morgan')
const errorHandler = require('./middlewares/errorMiddleware.js')
const app = new express()
require('dotenv').config()
const createError = require('http-errors')

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
)


app.use(express.json({ limit: '20kb' }))
app.use(express.urlencoded({ extended: true, limit: '20kb' }))
// app.use(express.static("public") only if we have any docs
// tes
//! DONOT DELETE
app.get('/api/health-check',((req, res) =>{
  res.status(200).send('connected to user-service api!!')
}))

//main API
app.use(logger('dev'))
app.use('/api/v1', paymentRoute)
// 404
app.all('*', (req, res, next) => {
  const err = new createError(
    404,
    `Cant find the ${req.originalUrl} on the payment service server !`
  )
  next(err)
})

// Use the error-handling middleware
app.use(errorHandler)

// Export the Express app for use in the handler.js file
module.exports = app
