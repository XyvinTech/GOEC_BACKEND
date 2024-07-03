const createError = require('http-errors')
const { signAccessToken } = require('../utils/jwt_helper');
const User = require('../models/userSchema');
const mongoose = require('mongoose');
const moment = require('moment');
const Role = require('../models/rolesSchema');
const Admin = require('../models/adminSchema');

const { generateRandomPassword } = require('../utils/generateRandomPassword');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { sendWelcomeMail } = require('../services/notification-service-api');

exports.adminSignIn = async (req, res) => {
  const { email, password } = req.body

  const user = await Admin.findOne({ email: email.trim() }).populate('role')
  if (!user) return res.status(400).json({ status: false, error: 'User not found' })

  const match = await comparePassword(password, user.password);
  if (!match) return res.status(400).json({ status: false, error: 'Invalid password' })
console.log('--->',user,user.role,email)
  let token = await signAccessToken(user, user.role, email)
  res.status(200).json({ success: true, token: token })
}


//list
exports.userList = async (req, res) => {

  const { pageNo, searchQuery } = req.query;

  const filter = {};

  if (searchQuery) {
    filter.$or = [
        { username: { $regex: searchQuery, $options: 'i' } }, 
        { email: { $regex: searchQuery, $options: 'i' } }, 
        { mobile: { $regex: searchQuery, $options: 'i' } }, 
    ];
}


  let pipedData = await User.aggregate([

    {
      $sort: {
        createdAt: -1,
      }
    },
    { $match: filter },

    {
      $lookup: {
        from: 'chargingtariffs', // Assuming the name of the RFID collection is 'rfidtags'
        localField: 'chargingTariff',
        foreignField: '_id',
        as: 'tariffValues'
      }
    },

    {
      $lookup: {
        from: 'rfidtags', // Assuming the name of the RFID collection is 'rfidtags'
        localField: 'rfidTag',
        foreignField: '_id',
        as: 'rfidValues'
      }
    },
    {
      $project: {
        mobile: 1,
        username: 1,
        email: 1,
        rfidValues: 1,
        tariffValues: 1
      }
    }

  ]).skip(10*(pageNo-1)).limit(10);

  let user = pipedData

  let totalCount = await User.find(filter).countDocuments()


  if (!user) {
    res.status(404).json({ status: false, message: 'User not found' })
  } else {
    res.status(200).json({ status: true, message: 'Ok', result: user, totalCount })
  }


}


exports.userDataById = async (req, res) => {

  let id = req.params.id

  let pipedData = await User.aggregate([


    { $match: { _id: new mongoose.Types.ObjectId(id) } },




    {
      $lookup: {
        from: 'ocpptransactions',
        localField: '_id',
        foreignField: 'user',
        as: 'transactions'
      }
    },

    {
      $unwind: {
        path: "$transactions",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: '$_id',
        mobile: { $first: '$mobile' },
        username: { $first: '$username' },
        email: { $first: '$email' },
        total_units: { $first: '$total_units' },
        total_sessions: { $first: '$total_sessions' },
        createdAt: { $first: '$createdAt' },
        wallet: { $first: '$wallet' },
        totalAmount: { $sum: '$transactions.totalAmount' }
      }
    },


    {
      $project: {
        mobile: 1,
        username: 1,
        email: 1,
        total_units: 1,
        total_sessions: 1,
        createdAt: 1,
        wallet: 1,
        totalAmount: 1
      }
    }

  ])

  let user = pipedData



  if (!user) {
    res.status(404).json({ status: false, message: 'User not found' })
  } else {
    res.status(200).json({ status: true, message: 'Ok', result: user })
  }


}

exports.userDatabyPhoneOrEmail = async (req, res) => {

  const { email, phoneNumber } = req.query;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: 'Please provide either email or phoneNumber parameter' });
  }

  let query = {};

  if (email) {
    query.email = email;
  }

  if (phoneNumber) {
    query.mobile = "+"+phoneNumber.trim();
  }

  const user = await User.findOne(query, 'username mobile email rfidTag');

  const pipedData = await User.aggregate([
    { $match: query },
    {
      $lookup:
      {
        from: "rfidtags",
        localField: "rfidTag",
        foreignField: "_id",
        as: "rfidDetails",
      },
    },


    {
      $project: {
        mobile: 1,
        username: 1,
        email: 1,
        userId: 1,
        rfidDetails: 1
      }
    }

  ])



  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ message: 'OK', success: true, result: pipedData });
}

exports.favoriteStations = async (req, res) => {

  const { pageNo } = req.query;

  let id = req.params.id

  let pipedData = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    { $unwind: "$favoriteStations" }, // Unwind the favoriteStations array
    {
      $lookup: {
        from: "chargingstations",
        localField: "favoriteStations",
        foreignField: "_id",
        as: "stationData"
      }
    },
    { $unwind: "$stationData" }, // Unwind the favoriteStations array
    {
      $project: {
        "chargingStationName": "$stationData.name",
        "address": "$stationData.address",
        "owner": "$stationData.owner",
        "latitude": "$stationData.latitude",
        "longitude": "$stationData.longitude",
      }
    }
  ]).skip(10*(pageNo-1)).limit(10);

  let user = pipedData

  let totalCount = await User.find({_id: new mongoose.Types.ObjectId(id)}).countDocuments()


  if (!user) {
    res.status(404).json({ status: false, message: 'User not found' })
  } else {
    res.status(200).json({ status: true, message: 'Ok', result: user, totalCount })
  }


}

exports.chargingTariff = async (req, res) => {
  let id = req.params.id

  let user = await User.aggregate(
    [
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup:
        {
          from: "chargingtariffs",
          localField: "chargingTariff",
          foreignField: "_id",
          as: "tariffDetails",
        },
      },
      {
        $unwind:
        {
          path: "$tariffDetails",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup:
        {
          from: "taxes",
          localField: "tariffDetails.tax",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                _id: 0,
                name: 1,
                percentage: 1,
              }
            }
          ],
          as: "taxDetails",
        },
      },
      {
        $unwind:
        {
          path: "$taxDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project:
        {
          _id: 0,
          "name": "$tariffDetails.name",
          "tariffType": "$tariffDetails.tariffType",
          "value": "$tariffDetails.value",
          "serviceAmount": "$tariffDetails.serviceAmount",
          taxDetails: "$taxDetails",
        },
      },
    ])

  if (!user) {
    res.status(404).json({ status: false, message: 'User not found' })
  } else {
    res.status(200).json({ status: true, message: 'Ok', result: user[0] || null })
  }


}

exports.vehicleDetails = async (req, res) => {
  let id = req.params.id

  let result = await User.aggregate(
    [
      { $match: { _id: new mongoose.Types.ObjectId(id) } },

      {
        $unwind:
        {
          path: "$vehicle",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup:
        {
          from: "vehicles",
          localField: "vehicle.vehicleRef",
          foreignField: "_id",
          as: "vehicleDetails",
        },
      },
      {
        $unwind:
        {
          path: "$vehicleDetails",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup:
        {
          from: "brands",
          localField: "vehicleDetails.brand",
          foreignField: "_id",
          as: "brandDetails",
        },
      },
      {
        $unwind:
        {
          path: "$brandDetails",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project:
        {
          _id: 0,
          evRegNumber: "$vehicle.evRegNumber",
          brand: "$brandDetails.brandName",
          model: "$vehicleDetails.modelName",
          numberOfPorts:
            "$vehicleDetails.numberOfPorts",
          icon: "$vehicleDetails.icon",
          compactable_port:
            "$vehicleDetails.compactable_port",
        },
      },
    ]
  )

  if (!result) {
    res.status(404).json({ status: false, message: 'User not found' })
  } else {
    res.status(200).json({ status: true, message: 'Ok', result: result })
  }


}


exports.rfidDetails = async (req, res) => {

  const { pageNo } = req.query;

  let id = req.params.id

  let result = await User.aggregate(
    [
      { $match: { _id: new mongoose.Types.ObjectId(id) } },

      {
        $unwind:
        {
          path: "$rfidTag",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $lookup:
        {
          from: "rfidtags",
          localField: "rfidTag",
          foreignField: "_id",
          as: "rfidDetails",
        },
      },
      {
        $unwind:
        {
          path: "$rfidDetails",
          preserveNullAndEmptyArrays: false,
        },
      },

      {
        $project:
        {
          _id: "$rfidDetails._id",
          serialNumber: "$rfidDetails.serialNumber",
          rfidTag: "$rfidDetails.rfidTag",
          status: "$rfidDetails.status",
          expiry:
            "$rfidDetails.expiry",
          rfidType: "$rfidDetails.rfidType",

        },
      },
    ]
  ).skip(10*(pageNo-1)).limit(10);

  let totalCount = await User.find({ _id: new mongoose.Types.ObjectId(id) }).countDocuments()


  let final = result.map((item) => {
    return {
      rfidTag: item.rfidTag || 'unavailable',
      createdOn: moment(item.createdAt).format('DD-MM-YYYY') || 'unavailable',
      expiry: moment(item.expiry).format('DD-MM-YYYY') || 'unavailable',
      serialNumber: item.serialNumber || 'unavailable',
      status: item.status || 'unavailable',
      id: item._id || 'unavailable',
      rfidType: item.rfidType || 'no type'
    }
  })


  res.status(200).json({ status: true, message: 'Ok', result: final, totalCount })

}

//Chargingtariff
exports.assignUnassignChargingTariff = async (req, res) => {

  const userId = req.params.userId;
  const chargingTariff = req.body.chargingTariff;

  const updateOperation = chargingTariff ? { $set: { chargingTariff } } : { $unset: { chargingTariff: "" } };

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updateOperation,
    { new: true }
  );

  if (!updatedUser) {
    res.status(404).json({ status: false, message: 'User not found' })
  } else {
    res.status(200).json({ status: true, message: 'Ok', result: updatedUser.chargingTariff })
  }
}

// remove a rfidTag


//Chargingtariff
exports.suggestions = async (req, res) => {

  const { query } = req.query;

  const users = await User.find({
    $or: [
      { username: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { mobile: { $regex: query, $options: 'i' } }
    ]
  }, { username: 1, mobile: 1, email: 1, _id: 1, firebaseToken: 1 });

  res.status(200).json({ status: true, result: users, message: 'ok' })

}


//role
exports.createRole = async (req, res) => {

  const { roleName, roleDescription, isActive, functionalPermissions, locationalPermissions } = req.body;

  const permissions = transformFunctionalPermissions(functionalPermissions);
  const location_access = transformLocationalPermissions(locationalPermissions);
  const newRole = new Role({
    role_name: roleName,
    description: roleDescription,
    isActive: isActive,
    permissions,
    location_access
  });
  const savedRole = await newRole.save();
  res.status(201).json(savedRole);

}


exports.getRole = async (req, res) => {

  let roleData = await Role.find()

  const formattedData = roleData.map(role => {

    let accessType;
    if (role.location_access && role.location_access.length > 0 && role.permissions && role.permissions.length > 0) {
      accessType = 'location access, functional access';
    } else if (role.location_access && role.location_access.length > 0) {
      accessType = 'location access';
    } else if (role.permissions && role.permissions.length > 0) {
      accessType = 'functional access';
    } else {
      accessType = 'no access';
    }
    return {
      '_id': role._id,
      'roleName': role.role_name,
      'createdOn': new Date(role.createdAt).toLocaleString(),
      'accessType': accessType,
      'locationAccess': role.location_access,
      'permissions': role.permissions,
      'description': role.description,
      'status': role.isActive ? 'Active' : 'Inactive'
    };
  });
  res.status(200).json({ status: true, result: formattedData })

}

exports.getRoleById = async (req, res) => {
  let {id} = req.params

  let roleData = await Role.findById(id);

  if (!roleData) {
    return res.status(404).json({ status: false, message: 'Role not found' });
  }

  let accessType;
  if (roleData.location_access && roleData.location_access.length > 0 && roleData.permissions && roleData.permissions.length > 0) {
    accessType = 'location access, functional access';
  } else if (roleData.location_access && roleData.location_access.length > 0) {
    accessType = 'location access';
  } else if (roleData.permissions && roleData.permissions.length > 0) {
    accessType = 'functional access';
  } else {
    accessType = 'no access';
  }

  const formattedData = {
    '_id': roleData._id,
    'roleName': roleData.role_name,
    'createdOn': new Date(roleData.createdAt).toLocaleString(),
    'accessType': accessType,
    'locationAccess': roleData.location_access,
    'permissions': roleData.permissions,
    'description': roleData.description,
    'status': roleData.isActive ? 'Active' : 'Inactive'
  };

  res.status(200).json({ status: true, result: formattedData })

}


exports.deleteRole = async (req, res) => {

  const { id } = req.params;
  const deletedRole = await Role.findByIdAndDelete(id);
  res.status(200).json({ message: "Role successfully deleted", status: true });
}

exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { roleName, roleDescription, isActive, functionalPermissions, locationalPermissions } = req.body;
  const permissions = transformFunctionalPermissions(functionalPermissions);
  const location_access = transformLocationalPermissions(locationalPermissions);



  const updatedRole = await Role.findByIdAndUpdate(
    id,
    {
      role_name: roleName,
      description: roleDescription,
      isActive,
      permissions,
      location_access
    },
    { new: true }
  );




  res.status(200).json({ success: true, data: updatedRole });


}

exports.pushRole = async (req, res) => {
  const { id } = req.params;
  const { location_access } = req.body;

  try {
    const updatedRole = await Role.findByIdAndUpdate(
      id,
      {
        $push: { location_access: location_access }
      },
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedRole });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.popRole = async (req, res) => {
  const { id } = req.params;
  const { location_access } = req.body;

  try {
    const updatedRole = await Role.findByIdAndUpdate(
      id,
      {
        $pull: { location_access: location_access }
      },
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedRole });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



exports.createAdmin = async (req, res) => {

  const { name, designation, email, mobile, role, status } = req.body;

  const initialPassword = generateRandomPassword();
  const hashedPassword = await hashPassword(initialPassword);
  //send mail to admin
  let package = {
    name: name,
    email: email,
    designation: designation,
    password: initialPassword
  }
  await sendWelcomeMail(package)


  const newAdmin = new Admin({
    name: name,
    designation: designation,
    email: email,
    password: hashedPassword,
    mobile: mobile,
    role: role,
    status: status,
  });
  const savedAdmin = await newAdmin.save();
  res.status(201).json(savedAdmin);

}


exports.getAdmin = async (req, res) => {

  const { pageNo } = req.query;

  let adminData = await Admin.find().populate('role').skip(10*(pageNo-1)).limit(10);
  let totalCount = await Admin.countDocuments()

  const formattedData = adminData.map(role => {


    return {
      '_id': role._id,
      'name': role.name,
      'role': role.role?.role_name,
      'email': role.email,
      'phone': role.mobile,
      'designation': role.designation,
      'status': role.status ? "Active" : "Inactive"
    };
  });

  res.status(200).json({ status: true, result: formattedData, totalCount })

}



exports.deleteAdmin = async (req, res) => {
  const { id } = req.params;
   await Admin.findByIdAndDelete(id);

  return res.status(200).json({status:true, message: "Deleted Successfully" });


};


exports.updateAdmin = async (req, res) => {
 
    const { id } = req.params;
    const { name, designation, email, mobile, role, status } = req.body;

     await Admin.findByIdAndUpdate(id, {
      name,
      designation,
      email,
      mobile,
      role,
      status
    }, { new: true });



    res.status(200).json({status:true,message:'updated successfully'})

};








const transformFunctionalPermissions = (functionalPermissions) => {
  return functionalPermissions.reduce((acc, { functionName, view, modify }) => {
    if (view) acc.push(`${functionName}_view`);
    if (modify) acc.push(`${functionName}_modify`);
    return acc;
  }, []);
};

const transformLocationalPermissions = (locationalPermissions) => {
  return locationalPermissions.map(({ value }) => value);
};