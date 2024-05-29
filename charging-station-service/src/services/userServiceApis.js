const axios = require('axios')
require('dotenv').config()
const generateToken = require('../utils/generateToken')

const staticGlobalUrl = 'https://oxium.goecworld.com:5688'

const token = generateToken(process.env.AUTH_SECRET)

exports.updateRole = async (roleId, data) => {
  try {
    let userServiceUrl = process.env.USER_URL

    if (!userServiceUrl) userServiceUrl = staticGlobalUrl

    console.log('user service ',userServiceUrl);

    const response = await axios.put(
      `${userServiceUrl}/api/v1/admin/pushrole/${roleId}`,
      {location_access: data},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data
  } catch (error) {
    console.error('Error fetching rating:', error)
    return null
  }
}

exports.removeLoc = async (roleId, data) => {
  try {
    let userServiceUrl = process.env.USER_URL
    if (!userServiceUrl) userServiceUrl = staticGlobalUrl
    console.log(userServiceUrl);
    const response = await axios.put(
      `${userServiceUrl}/api/v1/admin/poprole/${roleId}`,
      {location_access: data},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data
  } catch (error) {
    console.error('Error fetching rating:', error)
    return null
  }
}