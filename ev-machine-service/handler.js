const app = require('./src/app.js')
const connectDB = require('./src/db')


const PORT = process.env.PORT || 5691

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
