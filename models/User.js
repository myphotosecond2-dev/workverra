import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  phone: String,
  role: String,
  city: String,

  otp: String,
  otpExpiry: Date,
  isPhoneVerified: Boolean,
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;