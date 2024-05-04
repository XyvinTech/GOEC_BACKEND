const express = require('express')
const cors = require('cors')
const reviewRoute = require('./routes/reviewRoutes.js')
const logger = require('morgan')
const errorHandler = require('./middlewares/errorMiddleware.js')
const app = new express()
const cookieParser = require('cookie-parser')
const createError = require('http-errors')
const authVerify = require('./middlewares/authVerify.js')

require('dotenv').config()

app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }
))




app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({ extended: true , limit:"20kb" }))
// app.use(express.static("public") only if we have any docs

app.use(cookieParser())


//! DONOT DELETE
app.get('/api/health-check',((req, res) =>{
  res.status(200).send('connected to review-service api!!')
}))


//main API
app.use(logger('dev'))
app.use('/api/v1', authVerify, reviewRoute)

// 404 
app.all('*', (req, res, next) => {
    const err = new createError(
      404,
      `Cant find the ${req.originalUrl} on the review service server !`
    )
    next(err)
  })
// Use the error-handling middleware
app.use(errorHandler)

// Export the Express app for use in the handler.js file
module.exports = app;
