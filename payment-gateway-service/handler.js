const loadSecrets = require('./src/config/env.config.js')
require('dotenv').config()
//t2
if (process.env.ENVIRONMENT === 'production') {
  loadSecrets()
    .then(() => {
      const app = require('./src/app.js')
      const PORT = process.env.PAY_PORT || 6684

      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
      })
    })
    .catch((err) => {
      console.error('Failed to load secrets', err)
    })
} else {
  const app = require('./src/app.js')
  const PORT = process.env.PAY_PORT || 6684

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}
