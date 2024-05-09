require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const express = require("express");
const cors = require('cors');
const ocppRoutes = require('./routes/ocppRoutes');
const logger = require('morgan');
const errorHandler = require('./middlewares/errorMiddleware');
const { webSocketServer } = require('./wsInit');
//!DONOT DELETE
const {  mobileWebSocketServer } = require('./wsInit/appWs'); //!DONOT DELETE
const createError = require('http-errors');
const PORT = process.env.PORT || 6500;
const app = express();
const app2 = new express();

require('dotenv').config()
const connectDB = require('./db');
const authVerify = require('./middlewares/authVerify');



app.use(cors({
  origin: '*',
  credentials: true
}));



const connectionInstance =  connectDB()
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

//! DONOT DELETEs
app.get('/api/health-check',((req, res) =>{
  res.status(200).send('connected to ocppws!!')
}))

//! DONOT DELETE
app.get('/api/health-check2',((req, res) =>{
  res.status(200).send('connected to ocpp api!!')
}))
app.use(logger('dev'));
app.use('/api/v1', authVerify, ocppRoutes);


// Start WebSocket serverr
webSocketServer.listen(5500).then(() => {
  console.log("WebSocket Server started at 5500");
}).catch((err) => {
  console.error("Error starting WebSocket server:", err);
});

// 404
app.all('*', (req, res, next) => {
  const err = new createError(
    404,
    `Can't find the ${req.originalUrl} on the ocpp service server!`
  );
  next(err);
});

// Use the error-handling middleware
app.use(errorHandler);


app.listen(PORT, () => {
  console.log(`Express app listening on port ${PORT}`);
});

app2.listen(5500, () => {
  console.log(`Express app listening on port 5500 ws`);
});
// Export the Express app for use in other files
module.exports = app;