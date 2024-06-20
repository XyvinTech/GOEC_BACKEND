const { authenticateUserByRFID, authenticateUserByUserId } = require('../../services/user-service-api')
const saveLogs = require('../../utils/saveLogs')
let expire;
async function handleAuthorization({ params, identity }) {
    let messageType = 'Authorization';
    try {
        expire = await saveLogs(identity, messageType, params);

    } catch (error) {
        res.status(400).json({ status: false, message: `Internal Server Error ${error.message}` })
    }

    const idTag = params.idTag;
    let isAuthorized = false;
    try {

        // we have set up user unique id as alphanumeric less than 11 character
        // and serial number  greater than 10 to differentiate.
        if (idTag.length == 10) {

            isAuthorized = await authenticateUserByUserId(idTag)

        } else {
            isAuthorized = await authenticateUserByRFID(idTag)

        }
    } catch (error) {
        console.log(error);
    }


    if (isAuthorized) {
        const expiryDate = new Date(new Date(expire.createdAt).getTime() + 60 * 60 * 1000);
        return {
            idTagInfo: {
                status: "Accepted",
                expiryDate: expiryDate.toISOString(),
            },
        };
    } else {
        return {
            idTagInfo: {
                status: "Blocked",
            },
        };
    }
}


module.exports = { handleAuthorization }