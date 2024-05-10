const express = require('express');
const cors = require('cors')
const errorHandler = require('./middlewares/errorMiddleware.js')
const createError = require('http-errors')

const logRoute = require('./routes/logRoutes');
const authVerify = require('./middlewares/authVerify.js');
const app = new express();
require('dotenv').config()

app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }
))
app.use(express.json({limit:"20kb"}))
app.use(express.urlencoded({ extended: true , limit:"20kb" }))

//main API
//! DONOT DELETE
app.get('/api/health-check',((req, res) =>{
  res.status(200).send('connected to log-service api!!')
}))

app.use('/api/v1', authVerify, logRoute)


// 404 
app.all('*', (req, res, next) => {
    const err = new createError(
      404,
      `Cant find the ${req.originalUrl} on the log service server !`
    )
    next(err)
  })
// Use the error-handling middleware
app.use(errorHandler)

// Export the Express app for use in the handler.js file
module.exports = app;