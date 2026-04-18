import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Pending" },
    phone: { type: String, required: true, unique: true },
    role: { type: String, enum: ["employer", "worker"], default: "employer" },
    city: { type: String, default: "" },

    // Worker-specific fields
    skill: { type: String, default: "" },
    skills: { type: [String], default: [] },
    experience: { type: Number, default: 0 },
    hourlyRate: { type: Number, default: 0 },
    about: { type: String, default: "" },
    isAvailable: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    jobsDone: { type: Number, default: 0 },

    // Employer-specific fields
    companyName: { type: String, default: "" },
    companyType: { type: String, default: "" },

    // Auth
    otp: String,
    otpExpiry: Date,
    isPhoneVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
