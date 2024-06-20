const router = require('express').Router()
const reviewController = require('../controllers/reviewController')
const asyncHandler = require('../utils/asyncHandler')

//CRUD operations
router
  .post('/review/create', asyncHandler(reviewController.createReview))
  .get('/review/list', asyncHandler(reviewController.getReviewList))
  .get('/review/filteredList', asyncHandler(reviewController.filteredReviews))
  .get('/review/:reviewId', asyncHandler(reviewController.getReviewById))
  .put('/review/:reviewId', asyncHandler(reviewController.updateReview))
  .delete('/review/:reviewId', asyncHandler(reviewController.deleteReview))
  // .post('/review/byChargingStation/:chargingStation', asyncHandler(reviewController.getReviewByChargingStation))
  .post('/review/getReviews', asyncHandler(reviewController.getReviewByChargingStation))
  .get('/reviews/averageRating/:chargingStation/:evMachine', asyncHandler(reviewController.getAverageRating))
  .get('/reviews/feedbackReport', asyncHandler(reviewController.getFeedbackReport))

  .get('/review/byChargingStation/:chargingStation', asyncHandler(reviewController.getReviewByChargingStation))



module.exports = router
