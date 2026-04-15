const express = require('express')
const router = express.Router()

const bookingController = require('../controllers/bookingController')
console.log("BOOKING CONTROLLER:", bookingController)
const { protect } = require('../middleware/authMiddleware')

router.post('/', protect, bookingController.createBooking)
router.get('/', protect, bookingController.getMyBookings)

router.put('/:id/accept', protect, bookingController.acceptBooking)
router.put('/:id/reject', protect, bookingController.rejectBooking)
router.put('/:id/complete', protect, bookingController.completeBooking)

module.exports = router
