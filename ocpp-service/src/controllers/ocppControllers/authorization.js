const { authenticateUserByRFID, authenticateUserByUserId } = require('../../services/user-service-api');
const saveLogs = require('../../utils/saveLogs');

async function handleAuthorization({ params, identity, res }) {
    let messageType = 'Authorization';
    let expire;
    try {
        expire = await saveLogs(identity, messageType, params);
    } catch (error) {
        return res.status(400).json({ status: false, message: `Internal Server Error ${error.message}` });
    }

    const idTag = params.idTag;
    let isAuthorized = false;
    try {
        // We have set up user unique id as alphanumeric less than 11 characters
        // and serial number greater than 10 to differentiate.
        if (idTag.length === 10) {
            isAuthorized = await authenticateUserByUserId(idTag);
        } else {
            isAuthorized = await authenticateUserByRFID(idTag);
        }
    } catch (error) {
        console.log(error);
    }

    const expiryDate = new Date(new Date(expire.createdAt).getTime() + 60 * 60 * 1000); // Adding 1 hour to createdAt
    let data;

    if (isAuthorized) {
        data = {
            idTagInfo: {
                status: "Accepted",
                expiryDate: expiryDate.toISOString(),
            },
        };
    } else {
        data = {
            idTagInfo: {
                status: "Blocked",
            },
        };
    }

    // Always save AuthorizationConfirmation log
    try {
        console.log("Saving AuthorizationConfirmation log");
        await saveLogs(identity, "AuthorizationConfirmation", data, "CMS");
    } catch (error) {
        console.log(`Error saving AuthorizationConfirmation log: ${error.message}`);
    }

    return data;
}

module.exports = { handleAuthorization };
