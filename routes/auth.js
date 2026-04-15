const express = require('express')
const router = express.Router()

const {
  sendOTPHandler,
  verifyOTPHandler,
  registerHandler,
  getMe
} = require('../controllers/authController')

const { protect } = require('../middleware/authMiddleware')

// Send OTP
router.post('/send-otp', sendOTPHandler)

// Verify OTP
router.post('/verify-otp', verifyOTPHandler)

// Register user ✅ IMPORTANT
router.post('/register', registerHandler)

// Get current user
router.get('/me', protect, getMe)

module.exports = router