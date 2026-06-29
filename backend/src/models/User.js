const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { normalizePhone, validatePhone } = require("../utils/phone");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    /** Primary contact number (also exposed as phoneNumber in API responses). */
    phone: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
      validate: {
        validator(v) {
          if (!v) return true;
          return validatePhone(v);
        },
        message: "Phone number must be 10–15 digits",
      },
    },
    avatar: { type: String, default: "" },
    role: { type: String, enum: ["user", "guide", "admin"], default: "user" },
    isBlocked: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    isGuide: { type: Boolean, default: false },
    travelStyle: [{ type: String }],
    interests: [{ type: String }],
    languages: [{ type: String }],
    nationality: { type: String },
    bio: { type: String },
    trustScore: { type: Number, default: 50 },
    locationVisible: { type: Boolean, default: false },
    lastLatitude: { type: Number },
    lastLongitude: { type: Number },
    lastLocationAt: { type: Date },
    rewardPoints: { type: Number, default: 100 },
    walletBalance: { type: Number, default: 0 },
    referralCode: { type: String, unique: true, sparse: true, index: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Package" }],
    emailNotifications: { type: Boolean, default: true },
    emergencyContacts: [
      {
        name: String,
        phone: String,
        relation: String,
      },
    ],
    refreshToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpiry: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("phone") && this.phone) {
    this.phone = normalizePhone(this.phone) || undefined;
  }
  if (this.phone === "") this.phone = undefined;

  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpiry;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
