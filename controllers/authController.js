const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { generateOTP, sendOTP } = require('../utils/sendOTP')

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })

// Strip any +91 prefix → normalize to plain 10-digit phone
const normalizePhone = (phone) => {
  if (!phone) return ''
  return phone.toString().replace(/^\+91/, '').replace(/\D/g, '').slice(-10)
}

// ── POST /api/auth/send-otp ──
const sendOTPHandler = async (req, res) => {
  try {
    let { phone, role } = req.body
    phone = normalizePhone(phone)

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: 'Enter valid 10-digit phone number' })
    }

    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 min

    let user = await User.findOne({ phone })
    if (user) {
      user.otp = otp
      user.otpExpiry = otpExpiry
      await user.save()
    } else {
      // Create temp record — completed after OTP verification
      await User.findOneAndUpdate(
        { phone },
        {
          phone,
          otp,
          otpExpiry,
          role: role || 'employer',
          name: 'Pending',
          city: 'Pending',
        },
        { upsert: true, new: true }
      )
    }

    const result = await sendOTP(phone, otp)

    if (!result.success) {
      return res.status(500).json({ message: 'Failed to send OTP. Try again.' })
    }

    const response = { message: 'OTP sent successfully' }
    if (result.devMode || process.env.NODE_ENV === 'development') {
      response.devOtp = otp
      response.note = 'Dev mode — OTP shown in response'
    }

    return res.status(200).json(response)
  } catch (error) {
    console.error('sendOTP error:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// ── POST /api/auth/verify-otp ──
const verifyOTPHandler = async (req, res) => {
  try {
    let { phone, otp, role } = req.body
    phone = normalizePhone(phone)

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' })
    }

    const user = await User.findOne({ phone })

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please request OTP first.' })
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' })
    }

    if (new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' })
    }

    if (user.otp !== otp.toString()) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' })
    }

    // Clear OTP
    user.otp = undefined
    user.otpExpiry = undefined
    user.isPhoneVerified = true
    await user.save()

    const token = generateToken(user._id)
    const isNewUser = user.name === 'Pending'

    return res.status(200).json({
      message: 'OTP verified successfully',
      token,
      isNewUser,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        city: user.city,
        isVerified: user.isVerified,
        skill: user.skill,
        companyName: user.companyName,
      },
    })
  } catch (error) {
    console.error('verifyOTP error:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// ── POST /api/auth/register ──
// Called after OTP verify — fills full profile data
const registerHandler = async (req, res) => {
  try {
    let {
      phone, name, role, city,
      skill, skills, experience, hourlyRate, about,
      companyName, companyType,
    } = req.body

    phone = normalizePhone(phone)

    if (!phone || !name || !role || !city) {
      return res.status(400).json({ message: 'Phone, name, role and city are required' })
    }

    let user = await User.findOne({ phone })

    if (!user) {
      // First-time register without OTP (direct flow) — create new user
      user = new User({ phone, name, role, city, isPhoneVerified: false })
    }

    // Update profile
    user.name = name
    user.role = role
    user.city = city

    if (role === 'worker') {
      user.skill = skill
      user.skills = (skills && skills.length > 0) ? skills : [skill]
      user.experience = experience
      user.hourlyRate = hourlyRate
      user.about = about || ''
    }

    if (role === 'employer') {
      user.companyName = companyName || ''
      user.companyType = companyType || ''
    }

    await user.save()

    const token = generateToken(user._id)

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        city: user.city,
        skill: user.skill,
        companyName: user.companyName,
        isVerified: user.isVerified,
      },
    })
  } catch (error) {
    console.error('register error:', error)
    // Handle duplicate phone
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Phone number already registered. Please login.' })
    }
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// ── GET /api/auth/me ──
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-otp -otpExpiry')
    return res.status(200).json({ user })
  } catch (error) {
    return res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { sendOTPHandler, verifyOTPHandler, registerHandler, getMe }
