// const Razorpay = require('razorpay')

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_SECRET,
// })

// module.exports = razorpay

const Razorpay = require('razorpay')

// ❌ TEMPORARY FIX (no crash)
let razorpay = null

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  })
}

module.exports = razorpay