import express from "express";

const router = express.Router();

import {
  sendOTPHandler,
  verifyOTPHandler,
  registerHandler,
  getMe
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

// routes
router.post("/send-otp", sendOTPHandler);
router.post("/verify-otp", verifyOTPHandler);
router.post("/register", registerHandler);
router.get("/me", protect, getMe);

export default router;