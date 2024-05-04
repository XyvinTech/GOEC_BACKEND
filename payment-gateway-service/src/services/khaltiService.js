const axios = require('axios')

const { KHALTI_SECRET_KEY, KHALTI_GATEWAY_URL, KHALTI_RETURN_URL } = process.env

const initializeKhaltiPayment = async (amount) => {
  const data = {
    return_url: KHALTI_RETURN_URL,
    website_url: 'https://example.com/',
    amount: amount * 100,
    purchase_order_id: 'Order01',
    purchase_order_name: 'test',
  }

  const config = {
    headers: {
      Authorization: `Key ${KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  }

  try {
    const response = await axios.post(
      `${KHALTI_GATEWAY_URL}epayment/initiate/`,
      data,
      config
    )
    return response.data
  } catch (error) {
    console.error('Error initializing Khalti payment:', error)
    throw error
  }
}

const verifyKhaltiPayment = async (req, res) => {
  const config = {
    headers: {
      Authorization: `Key ${KHALTI_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  }

  const { pidx } = req.query

  try {
    const response = await axios.post(
      `${KHALTI_GATEWAY_URL}epayment/lookup/`,
      { pidx: pidx },
      config
    )
    res.json(response.data)
  } catch (error) {
    console.error('Error verifying Khalti payment:', error)
    throw error
  }
}

module.exports = { initializeKhaltiPayment, verifyKhaltiPayment }
