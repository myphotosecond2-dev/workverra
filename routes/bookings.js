import express from "express";
import {
  createBooking,
  getMyBookings,
  acceptBooking,
  rejectBooking,
  completeBooking,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/", protect, getMyBookings);
router.put("/:id/accept", protect, acceptBooking);
router.put("/:id/reject", protect, rejectBooking);
router.put("/:id/complete", protect, completeBooking);

export default router;
