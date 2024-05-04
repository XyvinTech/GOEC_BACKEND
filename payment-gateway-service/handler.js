const app = require('./src/app.js')



const PORT = process.env.PORT || 6684

// Connect to MongoDB

try {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error(`Error starting the server: ${error.message}`);
}