const OCPPLOG = require('../models/ocppLogs')



async function saveLogs(identity, messageType, params) {
    try {
  
  
      let log = {
        source: 'CP',
        CPID: identity,
        messageType: messageType,
        payload: params
      }
  
  
      let ocpp_log = await OCPPLOG(log);
      await ocpp_log.save()
    } catch (error) {
      console.log(error + `Error saving`)
  
    }
  }

  module.exports = saveLogs