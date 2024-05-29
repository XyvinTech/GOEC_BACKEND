const createError = require('http-errors')
const ChargingStation = require('../models/chargingStationSchema')
// @ts-ignore
const { chargingStationSchema, chargingStationEditSchema, addRatingSchema } = require('../validation/chargingStationSchema')
const axios = require('axios')
require('dotenv').config();
const { getRating } = require('../services/reviewServiceApis')
// @ts-ignore
const { getChargerDetails, deleteChargers } = require('../services/evMachineServiceApis')
// @ts-ignore
const { getChargingTariff } = require('../services/configurationServiceApis')
const { axiosErrorHandler } = require('../utils/axiosErrorHandler')
const staticUserGlobalUrl = "'https://oxium.goecworld.com:5688'" //using this in case user service api or evMachine service api is not set in env 
const findCommonReturnData = 'name address latitude longitude chargers status type image startTime stopTime amenities owner createdAt'
const mongoose = require('mongoose')
const { getSoC } = require('../services/ocppServiceApis');
const generateToken = require('../utils/generateToken');
const { updateRole, removeLoc } = require('../services/userServiceApis');
const { signAccessToken } = require('../utils/jwt_helper');
const token = generateToken(process.env.AUTH_SECRET);

// Create a new chargingStations
exports.createChargingStation = async (req, res) => {
  const { latitude, longitude, ...otherFields } = req.body;

  const chargingStation = new ChargingStation({
    location: {
      type: 'Point', // Assuming 'Point' as the default type
      coordinates: [longitude, latitude],
    },
    latitude: latitude,
    longitude: longitude,
    ...otherFields,
  });

  const savedChargingStation = await chargingStation.save()
  const upRole = await updateRole(req.role._id, savedChargingStation._id);
  let token = await signAccessToken(req.userId, upRole.data, req.userId.email)
  res.status(201).json({ status: true, message: 'Ok', result: savedChargingStation, token: token });
}

// Get a chargingStation by ID
exports.getChargingStationById = async (req, res) => {



  let userServiceUrl = process.env.USER_URL
  if (!userServiceUrl) userServiceUrl = staticUserGlobalUrl
  // return res.status(400).json({ status: false, status: false, message:  'USER_URL not set in env' })

  const userMobileNo = req.body.mobileNo
  const chargingStationId = req.params.chargingStationId

  // @ts-ignore
  if (!userMobileNo) return res.status(400).json({ status: false, status: false, message: 'mobileNo is a required field' })
  // @ts-ignore
  let pipedData, final_result, userApiResponse, userFavoriteStations, chargers_output, chargers, chargingStation;

  try {
    // @ts-ignore
    userApiResponse = await axios.get(`${userServiceUrl}/api/v1/users/user/byMobileNo/${userMobileNo}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
    userFavoriteStations = userApiResponse.data.result.favoriteStations


    chargingStation = await ChargingStation.findById(chargingStationId)
    if (!chargingStation) return res.status(404).json({ status: false, message: 'Charging Station not found' })




    pipedData = await ChargingStation.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(chargingStationId) } },

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
                connectors: 1
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
              $project: {
                _id: 1, // Assuming 'name' is the field you need
                charger_type: 1, // Replace 'phone' with the actual field name for phone
                output_type: 1,
                capacity: 1,
                no_of_ports: 1,
                connectors: 1
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
                'evMachines.chargingTariff': {

                  charger_tariff: {
                    $add: [
                      { $add: ['$serviceAmount', '$value'] },
                      {
                        $multiply: [
                          { $add: ['$serviceAmount', '$value'] },
                          { $divide: ['$taxDetails.percentage', 100] },
                        ]
                      }
                    ]
                  }
                }
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

              }
            }
          ],
          as: 'reviewDetails'
        }
      },
      { $unwind: { path: "$reviewDetails", preserveNullAndEmptyArrays: true } },



      {
        $group: {
          _id: "$_id",
          root: { $first: "$$ROOT" },
          evMachines: { $addToSet: "$evMachines" },
          // reviewDetails: { $push: "$reviewDetails" },
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

      {
        $project: {
          _id: 1,
          name: "$root.name" || "",
          address: "$root.address" || "",
          latitude: "$root.latitude" || null,
          longitude: "$root.longitude" || null,
          rating: "$averageRating" || 1,
          image: "$root.image" || "",
          amenities: "$root.amenities" || [],
          startTime: "$root.startTime" || "",
          stopTime: "$root.stopTime" || "",

          chargers: "$evMachines",
        }
      }
    ]);









    final_result = pipedData[0]


    chargers_output = await Promise.all(final_result.chargers.map(async charger => {

      const connectorTypes = charger.evModelDetails ?
        charger.evModelDetails[0].connectors.map(connector => ({
          ...connector,
          connectorType: connector.type || 'Unknown'
        })) : [];

      const connectorStatus = await fetchConnectorsWithSoC(charger.connectors, charger);

      const combinedConnectors = connectorTypes.map(connectorType => {
        const statusMatch = connectorStatus.find(status => status.connectorId === connectorType.connectorId);
        return {
          ...connectorType,
          ...(statusMatch && statusMatch)
        };
      });


      return {
        _id: charger._id,
        name: charger.name,
        evModel: charger.evModel,
        CPID: charger.CPID,
        chargingTariff: charger.chargingTariff,
        cpidStatus: charger.cpidStatus,
        output_types: charger.evModelDetails ? charger.evModelDetails[0].output_type : 0,
        charger_types: charger.evModelDetails ? charger.evModelDetails[0].charger_types : 0,
        capacity: charger.evModelDetails ? charger.evModelDetails[0].capacity : null,
        no_of_ports: charger.evModelDetails ? charger.evModelDetails[0].no_of_ports : 0,
        connectors: combinedConnectors.length > 0 ? combinedConnectors : 'nil',
        charger_tariff: charger.chargingTariffDetails ? parseFloat(charger.chargingTariffDetails[0].evMachines.chargingTariff.charger_tariff.toFixed(2)) : 0
      };
    }));










  } catch (error) {
    axiosErrorHandler(error)
  }

  const result = {
    _id: final_result._id,
    name: final_result.name || "",
    address: final_result.address || "",
    latitude: final_result.latitude || null,
    longitude: final_result.longitude || null,
    rating: final_result.rating || 1,
    image: final_result.image || "",
    amenities: final_result.amenities || [],
    startTime: final_result.startTime || "",
    stopTime: final_result.stopTime || "",
    // @ts-ignore
    isFavorite: userFavoriteStations.includes(chargingStation._id.toString()),
    chargers: chargers_output || [], //where the ev model is merged in side


  }

  res.status(200).json({ status: true, message: 'Ok', result: result })
}


//!testing
const fetchConnectorsWithSoC = async (connectors, charger) => {
  if (!connectors) return [];
  return await Promise.all(connectors.map(async (connector) => {
    let SOC = await getSoC(charger.name, connector.connectorId);
    return {
      ...connector,
      status: connector.status || 'Unknown',
      currentSoc: String(SOC) || '0'
    };
  }));
};
//!testing

// Get a chargingStation list
// @ts-ignore
exports.getChargingStationList = async (req, res) => {
  const chargingStation = await ChargingStation.find({}, findCommonReturnData)
  if (!chargingStation) {
    res.status(404).json({ status: false, message: 'Charging Station not found' })
  } else {
    res.status(200).json({ status: true, message: 'Ok', result: chargingStation })
  }
}

// Get a chargingStation list
exports.getChargingStationListByName = async (req, res) => {
  const name = req.body.name
  // @ts-ignore
  if (!name) throw new createError(400, "name required in body")

  const regexPattern = new RegExp(name, 'i');
  const chargingStations = await ChargingStation.find({ name: regexPattern }, 'latitude longitude name address')

  res.status(200).json({ status: true, message: 'Ok', result: chargingStations })
}


// Get a chargingStation list
exports.getFavoriteChargingStationList = async (req, res) => {
  let userServiceUrl = process.env.USER_URL
  if (!userServiceUrl) userServiceUrl = staticUserGlobalUrl
  // return res.status(400).json({ status: false, status: false, message:  'USER_URL not set in env' })

  const userMobileNo = req.body.mobileNo
  // @ts-ignore
  if (!userMobileNo) return res.status(400).json({ status: false, status: false, message: 'mobileNo is a required field' })

  // @ts-ignore
  let apiResponse = await axios.get(`${userServiceUrl}/api/v1/users/user/byMobileNo/${userMobileNo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  })

  const userFavoriteStations = apiResponse.data.result.favoriteStations
  let chargingStations = await ChargingStation.find({ _id: { $in: userFavoriteStations } }, findCommonReturnData)
  // Use Promise.all with map to handle asynchronous getRating calls
  // @ts-ignore
  chargingStations = await Promise.all(chargingStations.map(async chargingStation => {
    return {
      id: chargingStation._id,
      name: chargingStation.name,
      address: chargingStation.address,
      rating: await getRating(chargingStation._id), // Now properly awaited
      image: chargingStation.image || "",
      latitude: chargingStation.latitude || null,
      longitude: chargingStation.longitude || null,
    };
  }));

  res.status(200).json({ status: true, message: 'Ok', result: chargingStations })
}

// Get a chargingStation list
exports.getChargingStationUpdatedList = async (req, res) => {

  const { latitude, longitude } = req.body;


  const chargingStationList = await ChargingStation.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        distanceField: "distance",
        spherical: true,
      }
    },
    {
      $lookup: {
        from: "evmachines",
        localField: "_id",
        foreignField: "location_name",
        pipeline: [
          {
            $lookup: {
              from: "ev_models", // Replace with your actual evModel collection name
              localField: "evModel",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    output_type: 1,
                    capacity: 1,
                    connectors: 1,
                  },
                },
              ],
              as: "evModelDetails",
            },
          },
        ],
        as: "evMachines",
      },
    },

    {
      $group: {
        _id: "$_id",
        chargingStation: { $first: "$$ROOT" },
        distance: { $first: "$distance" },
        connectors: {
          $push: "$evMachines.connectors",
        },
        connectorsType: {
          $push:
            "$evMachines.evModelDetails.connectors.type",
        },
      },
    },
    {
      $sort: {
        distance: 1
      }
    }

  ])



  const result = await Promise.all(chargingStationList.map(async (station) => {


    let connectorsArray = station.connectors[0]
    const flatArray = connectorsArray.reduce((acc, curr) => acc.concat(curr), []);

    //to check availability
    const hasAvailableConnector = flatArray.some(connector => connector.status === 'Available');
    const hasUnavailableConnector = flatArray.every(connector => connector.status === 'Unavailable');
    const validConnectorStatus = ['Preparing', 'Charging', 'Finishing'];
    const hasBusyConnector = flatArray.every(connector => validConnectorStatus.includes(connector.status));

    //for connectors
    let flattenedBeforeConnectorsType = station.connectorsType[0]
    const uniqueArrays = [];
    const flattenedConnectorsType = flattenedBeforeConnectorsType.reduce((acc, types) => {
      const isDuplicate = uniqueArrays.some(array => JSON.stringify(array) === JSON.stringify(types));
      if (!isDuplicate) {
        uniqueArrays.push(types);
        return acc.concat(types);
      }
      return acc;
    }, []);

    const uniqueArrays2 = [];
    const flattenedConnectorsType2 = flattenedConnectorsType.reduce((acc, types) => {
      const isDuplicate = uniqueArrays2.some(array => JSON.stringify(array) === JSON.stringify(types));
      if (!isDuplicate) {
        uniqueArrays2.push(types);
        return acc.concat(types);
      }
      return acc;
    }, []);

    const onlyOne = [...new Set(flattenedConnectorsType2)];

    const charger_status = hasAvailableConnector
      ? 'Online'
      : hasUnavailableConnector
        ? 'Offline'
        : 'Busy'

    const evModelDetails = station.chargingStation.evMachines[0]?.evModelDetails[0];

    let station1 = station.chargingStation

    return {

      _id: station1._id,
      name: station1.name || "",
      address: station1.address || "",
      latitude: station1.latitude || null,
      longitude: station1.longitude || null,
      rating: await getRating(station1._id),
      isBusy: hasBusyConnector ? true : false,
      image: station1.image || "",
      amenities: station1.amenities,
      startTime: station1.startTime,
      owner: station1.owner,
      stopTime: station1.stopTime,
      charger_status: charger_status,
      outputType: evModelDetails?.output_type ? evModelDetails[0]?.output_type : "nil",
      connectorType: onlyOne || [],
      capacity: evModelDetails?.capacity || "",
    };
  }));




  res.status(200).json({ status: true, message: 'Ok', result: result })
}

//! Update a chargingStation by ID
exports.updateChargingStation = async (req, res) => {

  const chargingStationId = req.params.chargingStationId;
  const { latitude, longitude, ...otherFields } = req.body;

  let updateFields = {
    latitude: latitude,
    longitude: longitude,
    ...otherFields
  };


  if (latitude !== undefined && longitude !== undefined) {
    updateFields.location = {
      type: 'Point', // Assuming 'Point' as the default type
      coordinates: [longitude, latitude],
    };
  }

  const updatedChargingStation = await ChargingStation.findByIdAndUpdate(
    chargingStationId,
    { $set: updateFields },
    { new: true }
  )
  if (!updatedChargingStation) {
    res.status(404).json({ status: false, message: 'Charging Station not found' })
  } else {
    res.status(200).json(updatedChargingStation)
  }
}

// Delete a chargingStation by ID
exports.deleteChargingStation = async (req, res) => {
  const isExist = await ChargingStation.findById(req.params.chargingStationId)
  await deleteChargers(req.params.chargingStationId);
  const deletedChargingStation = await ChargingStation.findByIdAndDelete(req.params.chargingStationId)
  // const deletedChargingStation = true;
  if (!deletedChargingStation) {
    res.status(404).json({ status: false, message: 'Charging Station not found' })
  } else {
    await removeLoc(req.role._id, req.params.chargingStationId);
    res.status(204).end()
  }
}



exports.inbetweenPointsList = async (req, res) => {

  const { coordinates } = req.body;

  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    throw new Error(400, "Invalid or missing coordinates");
  }

  const convertedCoords = coordinates.map(coord => [coord[1], coord[0]]);
  if (convertedCoords[0][0] !== convertedCoords[convertedCoords.length - 1][0] ||
    convertedCoords[0][1] !== convertedCoords[convertedCoords.length - 1][1]) {
    convertedCoords.push(convertedCoords[0]); // Close the polygon
  }

  const routePath = {
    $geometry: {
      type: "Polygon",
      coordinates: [convertedCoords]
    }
  };

  const stations = await ChargingStation.find({
    location: {
      $geoWithin: routePath
    }
  });

  res.status(200).json({ success: true, count: stations.length, data: stations });

}
