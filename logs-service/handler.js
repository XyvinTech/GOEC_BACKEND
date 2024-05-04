const serverless = require('serverless-http')
const app = require('./src/app.js')
const connectDB = require('./src/db')

if (process.env.ENVIRONMENT === 'production') {
  module.exports.server = async (event, context) => {
    try {
      const connectionInstance = await connectDB()
      return serverless(app)(event, context)
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error)
    }
  }
} else {
  const PORT = process.env.PORT || 5570

  // Connect to MongoDB
  connectDB()
    .then(() => {
      // Database connected, start your server
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
      })
    })
    .catch((error) => {
      console.error('Failed to connect to MongoDB:', error)
      process.exit(1)
    })
}
