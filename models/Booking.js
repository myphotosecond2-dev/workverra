const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: String,
    time: String,
    address: String,
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
)

// ✅ THIS IS IMPORTANT
module.exports = mongoose.model('Booking', bookingSchema)