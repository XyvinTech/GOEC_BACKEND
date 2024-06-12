const createError = require('http-errors')
const moment = require('moment')
const WalletTransaction = require('../models/walletTransactionSchema')
const { walletTransactionSchema, walletTransactionEditSchema } = require('../validation/walletTransactionSchema')
const { addToWallet } = require('../../service/userService')

// Create a new walletTransaction
exports.createWalletTransaction = async (req, res) => {

  let body = req.body;
  if (!body.user) throw new createError(400, 'Required user for creating wallet transaction')
  // if (!body.transactionId) throw new createError(400, 'Required transactionId for creating wallet transaction')

  const walletTransaction = new WalletTransaction(req.body)
  const savedTransaction = await walletTransaction.save()
  res.status(201).json(savedTransaction)
}

// Get a walletTransaction by ID
exports.getWalletTransactionById = async (req, res) => {
  const walletTransaction = await WalletTransaction.findById(req.params.transactionId)
  if (!walletTransaction) {
    res.status(404).json({ error: 'Transaction not found' })
  } else {

    res.status(200).json(walletTransaction)
  }
}

// Get a walletTransaction list
exports.getWalletTransactionList = async (req, res) => {
  const walletTransaction = await WalletTransaction.find({}).sort({ createdAt: -1 })
  if (!walletTransaction) {
    res.status(404).json({ error: 'Transaction not found' })
  } else {
    res.status(200).json(walletTransaction)
  }
}

// Get a filtered walletTransaction list
exports.getFilteredWalletTransactionList = async (req, res) => {
  const fromDate = req.body.fromDate ? moment(req.body.fromDate, "DD-MM-YYYY").toDate() : ""
  const toDate = req.body.toDate ? moment(req.body.toDate, "DD-MM-YYYY").toDate() : ""
  if (!req.body.user) throw new Error("User required in body!!")

  const user = req.body.user
  const status = req.body.status || ''
  let filters = {
    type: { $in: ["wallet top-up", "admin top-up"] }
  }

  if (user) filters.user = user
  if (status) filters.status = status
  if (fromDate && toDate) {
    filters.createdAt = { $gte: fromDate, $lt: toDate }
  }

  const walletTransaction = await WalletTransaction.find(filters).sort({ createdAt: -1 });
  const result = walletTransaction.map(transaction => {
    transaction = transaction.toObject()
    return {
      ...transaction,
      createdAt: moment(transaction.createdAt).format("DD-MM-YYYY"),
    }
  })

  res.status(200).json({ status: true, result: result })
}


// Get a filtered walletTransaction list
exports.dashboardUserTransactionList = async (req, res) => {
  const fromDate = req.body.fromDate ? moment(req.body.fromDate, "DD-MM-YYYY").toDate() : ""
  const toDate = req.body.toDate ? moment(req.body.toDate, "DD-MM-YYYY").toDate() : ""
  if (!req.body.user) throw new Error("User required in body!!")
  const { pageNo } = req.query;

  const user = req.body.user
  const status = req.body.status || ''
  let filters = {}

  if (user) filters.user = user
  if (status) filters.status = status
  if (fromDate && toDate) {
    filters.createdAt = { $gte: fromDate, $lt: toDate }
  }


  const walletTransaction = await WalletTransaction.find(filters).sort({ createdAt: -1 }).skip(10*(pageNo-1)).limit(10);
  const result = walletTransaction.map(transaction => {
    transaction = transaction.toObject()
    return {
      ...transaction,
      createdAt: moment(transaction.createdAt).format("DD-MM-YYYY"),
    }
  })
  
  let totalCount = await WalletTransaction.find(filters).countDocuments()

  res.status(200).json({ status: true, result: result, totalCount })
}
// Update a walletTransaction by ID
exports.updateWalletTransaction = async (req, res) => {
  // const { error, value } = walletTransactionEditSchema.validate(req.body)

  // if (error)
  //   throw new createError(
  //     400,
  //     error.details.map((detail) => detail.message).join(', ')
  //   )

  const updatedTransaction = await WalletTransaction.findOneAndUpdate(
    { transactionId: req.params.transactionId },
    { $set: req.body },
    { new: true }
  )
  if (!updatedTransaction) {
    res.status(404).json({ error: 'Transaction not found' })
  } else {
    if (!updatedTransaction.userWalletUpdated && updatedTransaction.status == "success") {
      const userUpdated = await addToWallet(updatedTransaction.user, {
        amount: updatedTransaction.amount,
      })
      if (userUpdated) {
        await WalletTransaction.findOneAndUpdate(
          { transactionId: req.params.transactionId },
          { $set: { userWalletUpdated: true } },
          { new: true }
        )
      }
    }

    res.status(200).json(updatedTransaction)
  }
}

// Create or update walletTransaction
exports.createOrUpdateTransaction = async (req, res) => {
  let body = req.body;
  const { amount, transactionId } = body
  if (!body.user) throw new createError(400, 'Required user for creating wallet transaction')
  if (!transactionId) throw new createError(400, 'Required transactionId for creating wallet transaction')

  const alreadyExistingTransaction = await WalletTransaction.findOne({ transactionId })
  if (!alreadyExistingTransaction) {
    const walletTransaction = new WalletTransaction(req.body)
    const savedTransaction = await walletTransaction.save()
    res.status(201).json({ status: true, message: "Inserted" })
  }
  else {
    const updated = await WalletTransaction.updateOne(
      { transactionId },
      { $inc: { amount: amount } }
    )
    if (updated) res.status(201).json({ status: true, message: "Updated" })
    else res.status(401).json({ status: false, message: "Couldn't update the transaction" })
  }
}

// Delete a walletTransaction by ID
exports.deleteWalletTransaction = async (req, res) => {
  const deletedTransaction = await WalletTransaction.findByIdAndDelete(req.params.transactionId)
  if (!deletedTransaction) {
    res.status(404).json({ error: 'Transaction not found' })
  } else {
    res.status(204).end()
  }
}


exports.dashboardTransactionList = async (req, res) => {

  const maskMobileNumber = (mobile) => {
    mobile = mobile.toString();
    const firstPart = mobile.slice(0, 4);
    const lastPart = mobile.slice(-1);
    const maskedPart = '*'.repeat(mobile.length - 5);
    const maskedMobile = `${firstPart}${maskedPart}${lastPart}`;
    return maskedMobile;
}

  const { pageNo, searchQuery } = req.query;

  const filter = {};


  if (searchQuery) {
      filter.$or = [
          { status: { $regex: searchQuery, $options: 'i' } }, 
          { type: { $regex: searchQuery, $options: 'i' } }, 
          { 'userDetails.username': { $regex: searchQuery, $options: 'i' } }
      ];
  }

  let pipedData = await WalletTransaction.aggregate(

    [
      { $match: { type: { $ne: "charging deduction" } } },
      { $sort: { createdAt: -1 } },

      {
        $lookup: {
          from: 'users', // The name of the users collection
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $match: filter },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          amount: 1,
          type: 1,
          status: 1,
          transactionId: 1,
          currency: 1,
          userWalletUpdated: 1,
          user: '$userDetails.username',
          mobile: '$userDetails.mobile',
          external_payment_ref: 1,
          initiated_by: 1,
          reference: 1,
          invoice_id: 1,
          createdAt: 1,
          paymentId:1

        },
      },


    ]).skip(10*(pageNo-1)).limit(10);

    let piped = await WalletTransaction.aggregate(

      [
        { $match: { type: { $ne: "charging deduction" } } },
        { $sort: { createdAt: -1 } },
  
        {
          $lookup: {
            from: 'users', // The name of the users collection
            localField: 'user',
            foreignField: '_id',
            as: 'userDetails',
          },
        },
        {
          $unwind: {
            path: '$userDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            amount: 1,
            type: 1,
            status: 1,
            transactionId: 1,
            currency: 1,
            userWalletUpdated: 1,
            user: '$userDetails.username',
            external_payment_ref: 1,
            initiated_by: 1,
            reference: 1,
            invoice_id: 1,
            createdAt: 1,
  
          },
        },
  
  
      ]);

    let totalCount = searchQuery ? await WalletTransaction.find(filter).countDocuments() :  piped.length;

  const formattedResult = pipedData.map((item) => {
    return {
      ...item,
      amount: String(item.amount),
      type: item.type,
      status: item.status,
      transactionId: item.transactionId,
      currency: item.currency,
      userWalletUpdated: item.userWalletUpdated,
      user: item.user,
      mobile: maskMobileNumber(item.mobile),
      external_payment_ref: item.external_payment_ref || 'Nil',
      initiated_by: item.initiated_by || 'user',
      invoice_id: item.invoice_id || 'nil',
      reference: item.reference || 'payment-gateway',
      createdAt: moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss'),
    };
  });

  res.status(200).json({ status: true, success: "OK", result: formattedResult, totalCount })

}

exports.getReport = async (req, res) => {
  let { cpid, startDate, endDate } = req.query
  let filters = {}
  if (startDate && endDate) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(startDate) && /^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      let fromDate = moment(startDate, "YYYY-MM-DD").toDate()
      let toDate = moment(endDate, "YYYY-MM-DD").toDate()
      toDate.setDate(toDate.getDate() + 1)
      filters.createdAt = { $gte: fromDate, $lt: toDate }
    }
    else return res.status(400).json({ status: false, message: 'Date should be in "YYYY-MM-DD" Format' })
  }

  let result = await WalletTransaction.aggregate([
    { $match: filters },
    { $sort: { createdAt: -1 } },
    {
      $lookup:
      {
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
  ]);

  if (!result.length) return res.status(400).json({ status: false, message: 'No Data Found' })

  result = result.map(transaction => {

    return {
      date: moment(transaction.createdAt).format("DD/MM/YYYY HH:mm:ss"),
      type: transaction.type,
      amount: transaction.amount,
      status: transaction.status,
      transactionType: transaction.type,
      type: ["admin topup", "wallet top-up"].includes(transaction.type) ? "credit" : "debit",
      transactionId: transaction.type === "wallet top-up" ? transaction.transactionId : "-",
      external_payment_ref: transaction.external_payment_ref || "-",
      username: transaction.userDetails ? transaction.userDetails.username : "",
      paymentMode: "RazorPay",
    }
  })

  const headers = [
    { header: "Date", key: "date" },
    { header: "Transaction Type", key: "transactionType" },
    { header: "Total Amount", key: "amount" },
    { header: "Status", key: "status" },
    { header: "Type", key: "type" },
    { header: "OrderID", key: "transactionId" },
    { header: "External Reference", key: "external_payment_ref" },
    { header: "Name", key: "username" },
    { header: "Payment Mode", key: "paymentMode" },
  ]

  try {


    res.status(200).json({ status: true, message: 'OK', result: { headers: headers, body: result } })
  }
  catch (error) {
    res.status(400).json({ status: false, message: "Internal Server Error" })
  }

}

exports.getAccountTransactionReport = async (req, res) => {
  let { startDate, endDate } = req.query
  let filters = {}
  if (startDate && endDate) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(startDate) && /^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      let fromDate = moment(startDate, "YYYY-MM-DD").toDate()
      let toDate = moment(endDate, "YYYY-MM-DD").toDate()
      toDate.setDate(toDate.getDate() + 1)
      filters.createdAt = { $gte: fromDate, $lt: toDate }
    }
    else return res.status(400).json({ status: false, message: 'Date should be in "YYYY-MM-DD" Format' })
  }

  let result = await WalletTransaction.aggregate([
    { $match: filters },
    { $sort: { createdAt: -1 } },
    {
      $lookup:
      {
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
  ]);

  if (!result.length) return res.status(400).json({ status: false, message: 'No Data Found' })

  result = result.map(transaction => {

    return {
      date: moment(transaction.createdAt).format("DD/MM/YYYY HH:mm:ss"),
      type: transaction.type,
      currency: transaction.currency,
      amount: transaction.amount,
    }
  })

  const headers = [
    { header: "Date", key: "date" },
    { header: "Transaction Type", key: "type" },
    { header: "Currency", key: "currency" },
    { header: "Total Amount", key: "amount" },
  ]

  try {


    res.status(200).json({ status: true, message: 'OK', result: { headers: headers, body: result } })
  }
  catch (error) {
    res.status(400).json({ status: false, message: "Internal Server Error" })
  }

}