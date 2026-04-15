const express = require('express')
const router = express.Router()

const {
  createReview,
  getWorkerReviews
} = require('../controllers/reviewController')

const { protect } = require('../middleware/authMiddleware')

// Create review
router.post('/', protect, createReview)

// Get worker reviews
router.get('/:workerId', getWorkerReviews)

module.exports = router