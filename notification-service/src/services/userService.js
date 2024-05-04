const Notification = require("../models/notificationSchema")

const getAllUserIds = async () => {
    const result = await Notification.aggregate([
        {
            $limit: 1,
        },
        {
            $lookup: {
                from: "users",
                pipeline: [],
                as: "users",
            },
        },
        {
            $project: {
                _id: 1,
                users: "$users._id" // Project only the _id field from the users array
            }
        }
    ])
    return result[0].users ? result[0].users.map(user => user._id.toString()) : []
}

module.exports = { getAllUserIds }