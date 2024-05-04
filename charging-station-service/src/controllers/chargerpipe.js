export default chargerPipeData = await ChargingStation.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },

    {
        $lookup: {
            from: 'evmachines',
            localField: '_id',
            foreignField: 'location_name',
            pipeline: [ // Add this pipeline to project only required fields
                {
                    $project: {
                        _id: 1, // Assuming 'name' is the field you need
                        name: 1, // Replace 'phone' with the actual field name for phone
                        evModel: 1,
                        CPID: 1,
                        chargingTariff: 1,
                        cpidStatus: 1,
                    }
                }
            ],
            as: 'evMachines'
        }
    },

    { $unwind: { path: "$evMachines", preserveNullAndEmptyArrays: true } },
    {
        $lookup: {
            from: 'ev_models', // Replace with your actual evModel collection name
            localField: 'evMachines.evModel',
            foreignField: '_id',
            pipeline: [
                {
                    $lookup: { // Nested lookup for the oem collection
                        from: 'oems', // Replace with your actual oem collection name
                        localField: 'oem',
                        foreignField: '_id',
                        as: 'oemDetails'
                    }
                },
                {
                    $unwind: {
                        path: '$oemDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        model_name: 1, // Replace 'phone' with the actual field name for phone
                        oem: '$oemDetails.name',
                        output_type: 1,

                    }
                }
            ],
            as: 'evMachines.evModelDetails'
        }
    },
    {
        $lookup: {
            from: 'chargingtariffs', // Replace with your actual chargerTariff collection name
            localField: 'evMachines.chargingTariff',
            foreignField: '_id',
            pipeline: [
                {
                    $lookup: { // Nested lookup for the oem collection
                        from: 'taxes', // Replace with your actual oem collection name
                        localField: 'tax',
                        foreignField: '_id',
                        as: 'taxDetails'
                    }
                },
                {
                    $unwind: {
                        path: '$taxDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        tariffType: 1,
                        value: 1,
                        serviceAmount: 1,
                        tax_name: '$taxDetails.name',
                        tax_percentage: '$taxDetails.percentage',

                    }
                }
            ],
            as: 'evMachines.chargingTariffDetails'
        }
    },


    {
        $lookup: {
            from: "reviews",
            localField: '_id',
            foreignField: 'chargingStation',
            pipeline: [
                {
                    $project: {
                        _id: 1,
                        rating: 1,
                        comment: 1,
                        user: 1,
                    }
                }
            ],
            as: 'reviewDetails'
        }
    },
    { $unwind: { path: "$reviewDetails", preserveNullAndEmptyArrays: true } },

    {
        $lookup: {
            from: 'users',
            localField: 'reviewDetails.user',
            foreignField: '_id',
            pipeline: [

                {
                    $project: {
                        username: 1,
                        mobile: 1,
                        email: 1
                    }
                }
            ],
            as: 'reviewDetails.userDetails'
        }
    },

    {
        $group: {
            _id: "$_id",
            root: { $first: "$$ROOT" },
            evMachines: { $addToSet: "$evMachines" },
            reviewDetails: { $push: "$reviewDetails" },
            averageRating: { $avg: "$reviewDetails.rating" }
        }
    },
    {
        $replaceRoot: {
            newRoot: {
                $mergeObjects: ["$root", "$$ROOT"]
            }
        }
    },
]);
