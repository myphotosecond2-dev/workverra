const Booking = require('../models/Booking')

// CREATE BOOKING
const createBooking = async (req, res) => {
  try {
    const { workerId, skill, date, location, amount } = req.body

    const booking = await Booking.create({
      employer: req.user.id,
      worker: workerId,
      skill,
      date,
      location,
      amount,
    })

    res.status(201).json({ success: true, booking })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// ACCEPT BOOKING
const acceptBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)

    if (!booking) return res.status(404).json({ message: 'Not found' })

    booking.status = 'accepted'
    await booking.save()

    res.json({ message: 'Accepted', booking })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// REJECT BOOKING
const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)

    if (!booking) return res.status(404).json({ message: 'Not found' })

    booking.status = 'rejected'
    await booking.save()

    res.json({ message: 'Rejected', booking })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// COMPLETE BOOKING
const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)

    if (!booking) return res.status(404).json({ message: 'Not found' })

    booking.status = 'completed'
    await booking.save()

    res.json({ message: 'Completed', booking })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// GET BOOKINGS
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [
        { employer: req.user.id },
        { worker: req.user.id }
      ]
    })

    res.json(bookings)

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createBooking,
  acceptBooking,
  rejectBooking,
  completeBooking,
  getMyBookings,
}