const razorpay = require('../config/razorpay')
const Payment = require('../models/Payment')
const Booking = require('../models/Booking')
const crypto = require('crypto')

// ───────────── CREATE ORDER ─────────────
exports.createOrder = async (req, res) => {
  try {
    // ❗ Razorpay not configured
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Payment service not configured. Please try later.',
      })
    }

    const { bookingId } = req.body

    if (!bookingId) {
      return res.status(400).json({ message: 'Booking ID is required' })
    }

    const booking = await Booking.findById(bookingId)

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    // ❗ Prevent duplicate payment
    const existingPayment = await Payment.findOne({
      booking: bookingId,
      status: 'paid',
    })

    if (existingPayment) {
      return res.status(400).json({ message: 'Booking already paid' })
    }

    const options = {
      amount: booking.amount * 100, // paise
      currency: 'INR',
      receipt: `receipt_${booking._id}`,
    }

    const order = await razorpay.orders.create(options)

    const payment = await Payment.create({
      booking: booking._id,
      razorpayOrderId: order.id,
      amount: booking.amount,
      status: 'pending',
    })

    return res.status(200).json({
      success: true,
      order,
      paymentId: payment._id,
    })

  } catch (error) {
    console.error('createOrder error:', error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}


// ───────────── VERIFY PAYMENT ─────────────
exports.verifyPayment = async (req, res) => {
  try {
    // ❗ Razorpay not configured
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Payment service not configured. Please try later.',
      })
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
    } = req.body

    if (!paymentId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification fields',
      })
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex")

    // ❌ Signature mismatch
    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      })
    }

    const payment = await Payment.findById(paymentId)

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      })
    }

    // ❗ Prevent double update
    if (payment.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already verified',
      })
    }

    // ✅ Update payment
    payment.status = 'paid'
    payment.razorpayPaymentId = razorpay_payment_id
    payment.razorpaySignature = razorpay_signature

    await payment.save()

    // ✅ Update booking
    await Booking.findByIdAndUpdate(payment.booking, {
      status: 'completed',
    })

    return res.status(200).json({
      success: true,
      message: 'Payment successful',
    })

  } catch (error) {
    console.error('verifyPayment error:', error)
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}