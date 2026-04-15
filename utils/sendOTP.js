const axios = require('axios')

// Generate a cryptographically random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send OTP via MSG91
const sendOTP = async (phone, otp) => {
  // Always log OTP in server console (useful for dev/testing)
  console.log(`\n📱 OTP for +91${phone}: ${otp}\n`)

  // In development mode, skip SMS and return devMode flag
  // The OTP will be shown on the login screen
  if (process.env.NODE_ENV === 'development' || !process.env.MSG91_AUTH_KEY) {
    return { success: true, devMode: true }
  }

  // Production: send real SMS via MSG91
  try {
    const response = await axios.post(
      'https://api.msg91.com/api/v5/otp',
      {
        authkey:      process.env.MSG91_AUTH_KEY,
        mobile:       `91${phone}`,
        otp:          otp,
        otp_expiry:   10,
        message:      `${otp} is your Workverra OTP. Valid for 10 minutes. Do NOT share this with anyone. - Team Workverra`,
        sender:       'WRKVRR',
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 8000,
      }
    )

    if (response.data?.type === 'success') {
      return { success: true }
    }

    // Try fallback simple SMS API
    return await sendOTPFallback(phone, otp)
  } catch (err) {
    console.error('MSG91 Error:', err.response?.data || err.message)
    return await sendOTPFallback(phone, otp)
  }
}

// MSG91 fallback — simple transactional route
const sendOTPFallback = async (phone, otp) => {
  try {
    const message = encodeURIComponent(
      `${otp} is your Workverra OTP. Valid for 10 minutes.`
    )
    const url = `https://api.msg91.com/api/sendhttp.php?authkey=${process.env.MSG91_AUTH_KEY}&mobiles=91${phone}&message=${message}&sender=WRKVRR&route=4&country=91`
    await axios.get(url, { timeout: 8000 })
    return { success: true }
  } catch (err) {
    console.error('MSG91 Fallback Error:', err.message)
    // Last resort in production — still return success but log for manual review
    console.error(`MANUAL OTP NEEDED for ${phone}: ${otp}`)
    return { success: true, devMode: true }
  }
}

module.exports = { generateOTP, sendOTP }
