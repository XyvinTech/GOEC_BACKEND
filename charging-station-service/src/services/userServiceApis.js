const axios = require('axios')
require('dotenv').config()
const generateToken = require('../utils/generateToken')

const staticGlobalUrl = 'http://alb-762634556.ap-south-1.elb.amazonaws.com:5688'

const token = generateToken(process.env.AUTH_SECRET)

exports.updateRole = async (roleId, data) => {
  try {
    let userServiceUrl = process.env.USER_SERVICE_URL
    if (!userServiceUrl) userServiceUrl = staticGlobalUrl
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
    let userServiceUrl = process.env.USER_SERVICE_URL
    if (!userServiceUrl) userServiceUrl = staticGlobalUrl
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