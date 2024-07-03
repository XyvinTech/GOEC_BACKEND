const createError = require('http-errors')
const Review = require('../models/reviewSchema')
const { reviewSchema, reviewEditSchema } = require('../validation/reviewSchema')
const moment = require('moment')
const mongoose = require('mongoose');
// Create a new reviewss
exports.createReview = async (req, res) => {


  const { user, chargingStation, evMachine, rating, comment } = req.body

  if (!chargingStation) throw new createError(400, " chargingStation required")
  if (!rating && !comment) throw new createError(400, "rating or comment required")

  //if user already added review for a charging station, 
  const duplicateEntryFound = await Review.findOne({ user, chargingStation }, '_id')
  if (duplicateEntryFound) {
    let updateBody = {}
    if (rating) updateBody.rating = rating
    if (comment) updateBody.comment = comment

    await Review.updateOne({ _id: duplicateEntryFound._id }, { $set: updateBody })
    res.status(201).json({ status: true, message: 'Ok', result: 'Review updated Successfully' })
  }
  else {
    const review = new Review(req.body)
    const savedReview = await review.save()
    res.status(201).json({ status: true, message: 'Ok', result: savedReview })
  }
}

exports.getAverageRating = async (req, res) => {
  const { chargingStation, evMachine } = req.params
  let selectorBody = {}
  if (chargingStation) selectorBody.chargingStation = chargingStation
  if (evMachine != "null") selectorBody.evMachine = evMachine
  else selectorBody.evMachine = { $exists: false } //doing this because , in the case where a review is added for chargingStation, evMachine field will not be there
  const review = await Review.find(selectorBody, 'user rating comment createdAt')
  const sumOfRating = review.reduce((accumulator, currentObject) => {
    return accumulator + currentObject.rating;
  }, 0);
  const averageRating = review.length ? sumOfRating / review.length : 0
  res.status(200).json({ status: true, result: averageRating, message: 'Ok' })
}

// Get a review by Charging station
exports.getReviews = async (req, res) => {
  const { chargingStation, evMachine } = req.body
  let selectorBody = {}
  if (chargingStation) selectorBody.chargingStation = chargingStation
  if (evMachine) selectorBody.evMachine = evMachine
  else selectorBody.evMachine = { $exists: false } //doing this because , in the case where a review is added for chargingStation, evMachine field will not be there

  const review = await Review.find({ chargingStation: chargingStation })

  let pipedData = await Review.aggregate([
    { $match: { chargingStation: new mongoose.Types.ObjectId(chargingStation) } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        pipeline: [ // Add this pipeline to project only required fields
          {
            $project: {
              _id: 1,
              username: 1,
              image: 1
            }
          }
        ],
        as: 'userDetails'
      }
    }




  ])


  let formatedData = pipedData[0].userDetails[0]

  const result = review.map(review => {

    return {
      _id: review._id,
      rating: review.rating,
      comment: review.comment,
      username: formatedData.username,
      image: formatedData.image ? formatedData.image : 'https://picsum.photos/seed/picsum/200/300',
      createdAt: moment(review.createdAt).format('DD-MM-YYYY hh:mma'),
    }
  })

  if (!review) {
    res.status(404).json({ status: false, message: 'Review not found' })
  } else {
    res.status(200).json({ status: true, result: result, message: 'Ok' })
  }
}

// Get a review by ID
exports.getReviewById = async (req, res) => {
  const review = await Review.findById(req.params.reviewId)
  if (!review) {
    res.status(404).json({ status: false, message: 'Review not found' })
  } else {
    res.status(200).json({ status: true, message: 'Ok', result: review })
  }
}

// Get a review list
exports.getReviewList = async (req, res) => {
  const review = await Review.find({})
  if (!review) {
    res.status(404).json({ status: false, message: 'Review not found' })
  } else {
    res.status(200).json({ status: true, message: 'Ok', result: review })
  }
}

// Update a review by ID
exports.updateReview = async (req, res) => {
  const { error, value } = reviewEditSchema.validate(req.body)
  if (error) throw new createError(400, error.details.map((detail) => detail.message).join(', '))

  const updatedReview = await Review.findByIdAndUpdate(
    req.params.reviewId,
    { $set: req.body },
    { new: true }
  )
  if (!updatedReview) {
    res.status(404).json({ status: false, message: 'Review not found' })
  } else {
    res.status(200).json({ status: true, message: 'Ok', result: updatedReview })
  }
}

// Delete a review by ID
exports.deleteReview = async (req, res) => {
  const deletedReview = await Review.findByIdAndDelete(req.params.reviewId)
  if (!deletedReview) {
    res.status(404).json({ status: false, message: 'Review not found' })
  } else {
    res.status(204).json({ status: true, message: 'Ok' })
  }
}


exports.getReviewByChargingStation = async (req, res) => {

  let chargingStationId = req.body.chargingStation;
  const objectId = new mongoose.Types.ObjectId(chargingStationId); // Ensure the ID is a valid ObjectId
  const aggregatedData = await Review.aggregate([
    {
      $match: { chargingStation: objectId }
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userData"
      }
    },
    {
      $unwind: "$userData"
    },


    {
      $group: {
        _id: "$chargingStation",
        reviews: {
          $push: {
            user: {
              _id: "$_id",
              username: "$userData.username",
              user_phone: "$userData.mobile",
              rating: "$rating",
              comment: "$comment",
              createdAt: "$createdAt",
            }
          }
        }
      }
    },


    {
      $project: {
        _id: 0,
        chargingStation: "$_id",
        reviews: 1
      }
    }
  ]);

  const transformResponse = (originalResponse) => {
    const transformedResult = originalResponse.map((reviewGroup) => {
      return {
        chargingStationId: reviewGroup.chargingStation,
        reviews: reviewGroup.reviews.map((review) => {
          return {
            _id: review.user._id, // Assuming you have an ID for each review
            rating: review.user.rating,
            comment: review.user.comment,
            username: review.user.username,
            image: "https://picsum.photos/seed/picsum/200/300", // Replace with the actual image URL
            createdAt: moment(review.user.createdAt).format('DD-MM-YYYY hh:mma'), // Replace with the actual creation date
          };
        }),
      };
    });

    return {
      transformedResult,
    };
  };

  let result = transformResponse(aggregatedData)

  res.status(200).json({ status: true, message: 'Ok', result: result.transformedResult[0] ? result.transformedResult[0].reviews : [] })
}

exports.filteredReviews = async (req, res) => {
  let user = req.query.user
  let chargingStation = req.query.chargingStation

  let filter = {}
  if (chargingStation) filter.chargingStation = new mongoose.Types.ObjectId(chargingStation)
  if (user) filter.user = new mongoose.Types.ObjectId(user)


  const aggregatedData = await Review.aggregate([
    {
      $match: filter
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "userData"
      }
    },
    {
      $unwind: "$userData"
    },


    {
      $group: {
        _id: "$chargingStation",
        reviews: {
          $push: {
            user: {
              _id: "$_id",
              username: "$userData.username",
              user_phone: "$userData.mobile",
              rating: "$rating",
              comment: "$comment",
              createdAt: "$createdAt",
            }
          }
        }
      }
    },


    {
      $project: {
        _id: 0,
        chargingStation: "$_id",
        reviews: 1
      }
    }
  ]);

  const transformResponse = (originalResponse) => {
    const transformedResult = originalResponse.map((reviewGroup) => {
      return {
        chargingStationId: reviewGroup.chargingStation,
        reviews: reviewGroup.reviews.map((review) => {
          return {
            _id: review.user._id, // Assuming you have an ID for each review
            rating: review.user.rating,
            comment: review.user.comment,
            username: review.user.username,
            image: "https://picsum.photos/seed/picsum/200/300", // Replace with the actual image URL
            createdAt: moment(review.user.createdAt).format('DD-MM-YYYY hh:mma'), // Replace with the actual creation date
          };
        }),
      };
    });

    return {
      transformedResult,
    };
  };

  let result = transformResponse(aggregatedData)

  const finalRes = result.transformedResult.map(reviewGroup => {
    return {
      _id: reviewGroup.reviews[0]._id,
      rating: reviewGroup.reviews[0].rating,
      comment: reviewGroup.reviews[0].comment,
      username: reviewGroup.reviews[0].username,
      image: reviewGroup.reviews[0].image,
      createdAt: reviewGroup.reviews[0].createdAt,
    }
  })

  res.status(200).json({ status: true, message: 'Ok', result: finalRes ? finalRes : [] })
}


exports.getFeedbackReport = async (req, res) => {
  let { location, startDate, endDate } = req.query
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

  if (location) filters.chargingStation = new mongoose.Types.ObjectId(location);

  let result = await Review.find(filters).sort({createdAt: -1})

  result = result.map(review => {

    return {
      date: moment(review.createdAt).format("DD/MM/YYYY HH:mm:ss"),
      feedbackType: "Charging Feedback",
      rating: review.rating,
      feedback: review.comment
    }
  })

  const headers = [
    { header: "Date", key: "date" },
    { header: "Feedback Type", key: "feedbackType" },
    { header: "Rating", key: "rating" },
    { header: "Feedback", key: "feedback" },
  ]

  res.status(200).json({ status: true, message: 'OK', result: { headers: headers, body: result } })
}