import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateOTP, sendOTP } from "../utils/sendOTP.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const normalizePhone = (phone) => {
  if (!phone) return "";
  return phone.toString().replace(/^\+91/, "").replace(/\D/g, "").slice(-10);
};

// ── SEND OTP ──
export const sendOTPHandler = async (req, res) => {
  try {
    let { phone, role } = req.body;
    phone = normalizePhone(phone);

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Enter valid 10-digit phone number" });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    let user = await User.findOne({ phone });
    if (user) {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
    } else {
      await User.findOneAndUpdate(
        { phone },
        { phone, otp, otpExpiry, role: role || "employer", name: "Pending", city: "" },
        { upsert: true, new: true }
      );
    }

    const result = await sendOTP(phone, otp);

    if (!result.success) {
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    return res.status(200).json({
      message: "OTP sent successfully",
      ...(result.devMode && { devOtp: otp }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── VERIFY OTP ──
export const verifyOTPHandler = async (req, res) => {
  try {
    let { phone, otp } = req.body;
    phone = normalizePhone(phone);

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (new Date() > user.otpExpiry) return res.status(400).json({ message: "OTP expired" });
    if (user.otp !== otp.toString()) return res.status(400).json({ message: "Invalid OTP" });

    user.otp = undefined;
    user.otpExpiry = undefined;
    user.isPhoneVerified = true;
    await user.save();

    const token = generateToken(user._id);
    const isNewUser = user.name === "Pending" || !user.name;

    return res.status(200).json({ message: "OTP verified", token, user, isNewUser });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ── REGISTER ──
export const registerHandler = async (req, res) => {
  try {
    let {
      phone, name, role, city,
      skill, skills, experience, hourlyRate, about,
      companyName, companyType,
    } = req.body;

    phone = normalizePhone(phone);

    let user = await User.findOne({ phone });
    if (!user) user = new User({ phone });

    // Common fields
    user.name = name;
    user.role = role;
    user.city = city;

    // Worker fields
    if (role === "worker") {
      if (skill)      user.skill      = skill;
      if (skills)     user.skills     = skills;
      if (experience) user.experience = Number(experience);
      if (hourlyRate) user.hourlyRate = Number(hourlyRate);
      if (about)      user.about      = about;
      user.isAvailable = true;
    }

    // Employer fields
    if (role === "employer") {
      if (companyName) user.companyName = companyName;
      if (companyType) user.companyType = companyType;
    }

    await user.save();

    const token = generateToken(user._id);
    return res.status(201).json({ message: "Registration successful", token, user });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ── ME ──
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-otp -otpExpiry");
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
