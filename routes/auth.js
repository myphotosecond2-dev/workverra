import express from "express";
import {
  sendOTPHandler,
  verifyOTPHandler,
  registerHandler,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send-otp", sendOTPHandler);
router.post("/verify-otp", verifyOTPHandler);
router.post("/register", registerHandler);
router.get("/me", protect, getMe);

export default router;
