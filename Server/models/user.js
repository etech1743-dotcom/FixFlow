const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: false,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    profileImage: {
      type: String,
    },

    role: {
      type: String,
      enum: ["user", "worker", "admin"],
      default: "user",
      required: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    // GeoJSON Point: [longitude, latitude]
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        validate: {
          validator: function (coordinates) {
            if (!coordinates || coordinates.length === 0) {
              return true;
            }

            if (coordinates.length !== 2) {
              return false;
            }

            const [longitude, latitude] = coordinates;

            return (
              Number.isFinite(longitude) &&
              Number.isFinite(latitude) &&
              longitude >= -180 &&
              longitude <= 180 &&
              latitude >= -90 &&
              latitude <= 90
            );
          },
          message:
            "Coordinates must contain valid [longitude, latitude] values.",
        },
      },
    },

    category: {
      type: String,
      trim: true,
    },

    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    serviceArea: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Set this to false if workers require admin approval.
    isApproved: {
      type: Boolean,
      default: true,
    },

    dailyLimit: {
      type: Number,
      default: 5,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Daily limit must be a whole number.",
      },
    },

    resetPasswordToken: String,

    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Supports nearby-worker and nearby-ticket location queries.
userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);