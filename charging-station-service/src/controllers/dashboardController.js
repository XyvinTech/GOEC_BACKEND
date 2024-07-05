const ChargingStation = require('../models/chargingStationSchema')
const AWS = require('aws-sdk');
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const moment = require('moment');

const s3 = new AWS.S3();

const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid');

// Generate a unique identifier (UUID)
const uniqueId = uuidv4();



//for dashboard
exports.getChargingStationByIdForDashboard = async (req, res) => {

  let id = req.params.chargingStationId;
  let analytics;

  let doesExist = await ChargingStation.findOne({ _id: id });

  if (!doesExist) {
    return res.status(404).json({ error: 'Charging Station not found' });
  }

  let pipedData = await ChargingStation.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: "evmachines",
        localField: "_id",
        foreignField: "location_name",

        as: "evMachines",
      },
    },

    {
      $unwind: {
        path: "$evMachines",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "ev_models", // Replace with your actual evModel collection name
        localField: "evMachines.evModel",
        foreignField: "_id",
        pipeline: [
          {
            $lookup: {
              // Nested lookup for the oem collection
              from: "oems", // Replace with your actual oem collection name
              localField: "oem",
              foreignField: "_id",
              as: "oemDetails",
            },
          },
          {
            $unwind: {
              path: "$oemDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              model_name: 1, // Replace 'phone' with the actual field name for phone
              oem: "$oemDetails.name",
              output_type: 1,
            },
          },
        ],
        as: "evMachines.evModelDetails",
      },
    },

    {
      $lookup: {
        from: "ocpptransactions", // Replace with your actual evModel collection name
        localField: "evMachines.CPID",
        foreignField: "cpid",
        as: "transactionDetails",
      },
    },

    {
      $lookup: {
        from: "chargingtariffs", // Replace with your actual chargerTariff collection name
        localField: "evMachines.chargingTariff",
        foreignField: "_id",
        pipeline: [
          {
            $lookup: {
              // Nested lookup for the oem collection
              from: "taxes", // Replace with your actual oem collection name
              localField: "tax",
              foreignField: "_id",
              as: "taxDetails",
            },
          },
          {
            $unwind: {
              path: "$taxDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              tariffType: 1,
              value: 1,
              serviceAmount: 1,
              tax_name: "$taxDetails.name",
              tax_percentage:
                "$taxDetails.percentage",
            },
          },
        ],
        as: "evMachines.chargingTariffDetails",
      },
    },

    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "chargingStation",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",

              as: "userDetails",
            },
          },
          {
            $unwind: {
              path: "$userDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: 1,
              rating: 1,
              comment: 1,
              user: "$userDetails.username",
              mobile: "$userDetails.mobile",
              email: "$userDetails.email",
            },
          },
        ],
        as: "reviewDetails",
      },
    },

    {
      $group: {
        _id: "$_id",
        root: { $first: "$$ROOT" },
        evMachines: { $addToSet: "$evMachines" },

      },
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: ["$root", "$$ROOT"],
        },
      },
    },
  ]);

  let chargingStation = pipedData[0]
  console.log('------->', chargingStation)

  //? Analytics Count


  let transactions = chargingStation.transactionDetails;
  analytics = {};
  const totalCounts = transactions.length;
  const totalUnitsSum = transactions.reduce((sum, transaction) => {
    if (transaction.totalUnits) {
      return sum + (transaction.meterStop - transaction.meterStart);
    } else {
      return sum;
    }
  }, 0);
  const totalAmountsSum = transactions.reduce((sum, transaction) => {
    if (transaction.totalAmount) {
      return sum + transaction.totalAmount;
    } else {
      return sum;
    }
  }, 0);
  // @ts-ignore
  analytics.totalCounts = totalCounts
  // @ts-ignore
  analytics.totalUnitsSum = totalUnitsSum
  // @ts-ignore
  analytics.totalAmount = totalAmountsSum


  //? average rating

  let reviewDetails = chargingStation.reviewDetails;
  let totalRating = 0;
  let count = 0;

  reviewDetails.forEach(review => {
    if (review.rating) {
      totalRating += review.rating;
      count++;
    }
  });

  let averageRating = count > 0 ? totalRating / count : null;


  const result = {
    _id: chargingStation._id,
    name: chargingStation.name || "",
    address: chargingStation.address || "",
    latitude: chargingStation.latitude || null,
    longitude: chargingStation.longitude || null,
    owner: chargingStation.owner || "",
    owner_email: chargingStation.owner_email || "",
    owner_phone: chargingStation.owner_phone || "",
    location_support_name: chargingStation.location_support_name || "",
    location_support_email: chargingStation.location_support_email || "",
    location_support__phone: chargingStation.location_support__phone || "",
    tags: chargingStation.tags || [],
    status: chargingStation.status || 'Offline',
    commissioned_on: chargingStation.commissioned_on || '',
    average_rating: averageRating || 1,
    reviews: chargingStation.reviewDetails ? chargingStation.reviewDetails : [],
    image: chargingStation.image || "",
    amenities: chargingStation.amenities || [],
    startTime: moment(chargingStation.startTime, 'HH:mm').format('hh:mm A') || "",
    stopTime: moment(chargingStation.stopTime, 'HH:mm').format('hh:mm A') || "",
    chargers: chargingStation.evMachines[0].evModelDetails[0] ? chargingStation.evMachines : [],
    // @ts-ignore
    total_revenue: analytics?.totalAmount || 0,
    // @ts-ignore
    total_units: analytics?.totalUnitsSum || 0,
    // @ts-ignore
    numTransactions: analytics?.totalCounts || 0,
    published: chargingStation.published || true,
    vendor: chargingStation.vendor || '',
    category: chargingStation.category || '',


  }

  console.log()
  res.status(200).json({ status: true, message: 'Ok', result: result })

}






// @ts-ignore
exports.getChargingStationListForDashboard = async (req, res) => {
  const locations = req.role.location_access;
  const { pageNo, searchQuery } = req.query;

  const filter = {};

  if (searchQuery) {
    filter.$or = [
      { name: { $regex: searchQuery, $options: 'i' } },
      { address: { $regex: searchQuery, $options: 'i' } },
      { country: { $regex: searchQuery, $options: 'i' } },
      { state: { $regex: searchQuery, $options: 'i' } },
      { owner: { $regex: searchQuery, $options: 'i' } },
    ];
  }

  if(locations){
    filter._id = { $in:locations }
  }

  let list = await ChargingStation.find(filter).sort({ updatedAt: -1 }).skip(10 * (pageNo - 1)).limit(10);
  let totalCount = await ChargingStation.find(filter).countDocuments()
  res.status(200).json({ status: true, message: 'OK', result: list, totalCount })
}

exports.getChargingStationListForDropdown = async (req, res) => {
  const locations = req.role.location_access;

  const filter = {};

  if(locations){
    filter._id = { $in:locations }
  }

  let list = await ChargingStation.find(filter).sort({updatedAt:-1})
  let totalCount = await ChargingStation.find(filter).countDocuments()
  res.status(200).json({ status: true, message: 'OK', result: list, totalCount })
}

exports.imageUpload = async (req, res) => {


  const file = req.file;
  console.log(file)
  if (!file) return res.status(400).send('No file uploaded.');

  // Create a stream to S3
  const params = {
    Bucket: 'image-upload-oxium/charging-station',
    Key: `${uniqueId}-${file.originalname}`,
    ContentType: file.mimetype,
    Body: file.buffer,
    // ACL: 'public-read' // or another ACL setting
  };

  s3.upload(params, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    }


    // Send back the URL of the uploaded file
    res.send({ status: true, message: 'OK', url: data.Location });
  });


}


// @ts-ignore
exports.getChargingStationEvMachineList = async (req, res) => {
  let list = await ChargingStation.aggregate([
    {
      $project: {
        _id: 1,
        name: 1,
      }
    },
    {
      $lookup: {
        from: 'evmachines',
        localField: '_id',
        foreignField: 'location_name',
        pipeline: [ // Add this pipeline to project only required fields
          {
            $project: {
              _id: 1, // Assuming 'name' is the field you need
              CPID: 1,
            }
          }
        ],
        as: 'evMachines'
      }
    },
  ]);
  res.status(200).json({ status: true, message: 'OK', result: list })
}


exports.getCPIDListByChargingStationForDashboard = async (req, res) => {
  let id = req.params.chargingStationId;
  let pipeline = [];

  if (id === 'all') {
    pipeline = [
      {
        $lookup: {
          from: 'evmachines',
          localField: '_id',
          foreignField: 'location_name',
          as: 'evMachines'
        }
      },
      { $unwind: { path: "$evMachines", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          evMachines: '$evMachines'
        }
      }
    ];
  } else {pipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: 'evmachines',
        localField: '_id',
        foreignField: 'location_name',
        as: 'evMachines'
      }
    },
    { $unwind: { path: "$evMachines", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        evMachines: '$evMachines'
      }
    }
  ];
  }

  try {
    let list = await ChargingStation.aggregate(pipeline);
    res.status(200).json({ status: true, message: 'OK', result: list });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Error fetching data', error: err });
  }
}

