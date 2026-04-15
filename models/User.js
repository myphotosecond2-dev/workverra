const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },

    // FIX: Store as plain 10 digits always (normalized by controller)
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      unique: true,
      validate: {
        validator: (v) => /^\d{10}$/.test(v),
        message: 'Phone must be 10 digits',
      },
    },

    role: { type: String, enum: ['worker', 'employer', 'admin'], required: true },
    city: { type: String, required: true },
    state: { type: String, default: 'MP' },
    profilePhoto: { type: String, default: '' },

    // Worker fields
    skill: { type: String },
    skills: [{ type: String }],
    experience: { type: Number },
    hourlyRate: { type: Number },
    about: { type: String },
    certifications: [{ type: String }],
    languages: [{ type: String }],
    isVerified: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    verificationBadge: { type: String, default: null },
    totalJobs: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    // Employer fields
    companyName: { type: String },
    companyType: { type: String },

    // Auth
    otp: { type: String },
    otpExpiry: { type: Date },
    isPhoneVerified: { type: Boolean, default: false },

    // Google OAuth (FIX #14 — for future Google login support)
    googleId: { type: String },
    email: { type: String },
  },
  { timestamps: true }
)

userSchema.index({ city: 1, skill: 1 })
userSchema.index({ phone: 1 })

module.exports = mongoose.model('User', userSchema)
