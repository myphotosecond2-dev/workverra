import Review from "../models/Review.js";
import Booking from "../models/Booking.js";

export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      return res.status(400).json({ message: "Booking and rating required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.employer.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({ message: "Complete booking first" });
    }

    const existing = await Review.findOne({ booking: bookingId });
    if (existing) return res.status(400).json({ message: "Review already submitted" });

    const review = await Review.create({
      booking: bookingId,
      worker: booking.worker,
      employer: booking.employer,
      rating,
      comment,
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ worker: req.params.workerId }).populate("employer", "name");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
