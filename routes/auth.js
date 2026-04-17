import express from "express";

const router = express.Router();

import {
  sendOTPHandler,
  verifyOTPHandler,
  registerHandler,
  getMe
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

// Send OTP
router.post("/send-otp", sendOTPHandler);

// Verify OTP
router.post("/verify-otp", verifyOTPHandler);

// Register user
router.post("/register", registerHandler);

// Get current user
router.get("/me", protect, getMe);

export default router;