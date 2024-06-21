const saveLogs = require('../../utils/saveLogs');
const { generateUniqueTransactionID } = require('../../utils/uniqueNumber');
const { getUserIdAndChargingTariff, getUserDeviceToken } = require('../../services/user-service-api');
const { getChargingTariff } = require('../../services/ev-machine-api');
const { saveTransactionLog } = require('../../utils/transactionLog');
const { sendPushNotification } = require('../firebaseController');

async function handleStartTransaction({ params, identity }) {
    try {
        console.log(`Server got StartTransaction Notification from ${identity}:`, params);

        let chargingTariff, tax;
        const idTag = params.idTag;
        const messageType = 'StartTransaction';
        await saveLogs(identity, messageType, params);

        const transactionId = await generateUniqueTransactionID(9);  //! MongoDB Save 
        const userData = await getUserIdAndChargingTariff(idTag);
        if (!userData) throw new Error('User data not found');
        const transactionMode = idTag.length < 11 ? 'mobile' : 'rfid';

        if (userData.chargingTariff) {
            chargingTariff = userData.chargingTariff;
            tax = userData.tax;
        } else {
            const chargingTariffResult = await getChargingTariff(identity);
            if (!chargingTariffResult.status) throw new Error('charging tariff data not found');

            chargingTariff = chargingTariffResult.result.total;
            tax = chargingTariffResult.result.tax;
        }

        const userId = userData._id;
        try {
            let transaction_status = "Initiated";
            await saveTransactionLog(identity, params, transaction_status, transactionId, chargingTariff, userId, tax, transactionMode);

        } catch (error) {
            console.log(' Error', error);
        }

        // Prepare return data
        const returnData = {
            transactionId,
            idTagInfo: {
                status: "Accepted",
            },
        };

        // Save logs for the return data
        await saveLogs(identity, 'StartTransactionConfirmation', returnData, "CMS");

        // Send push notification if user device token exists
        const userDeviceToken = await getUserDeviceToken(userId);
        if (userDeviceToken) {
            let payload = {
                title: 'Transaction Started',
                body: `Your transaction ${transactionId} has started`,
            };
            sendPushNotification(userDeviceToken, payload, transactionId, userId);
        }

        return returnData;

    } catch (error) {
        console.log(error);
    }
}

module.exports = { handleStartTransaction };
