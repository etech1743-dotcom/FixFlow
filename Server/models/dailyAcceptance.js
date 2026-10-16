const mongoose = require("mongoose");

const dailyAcceptanceSchema = new mongoose.Schema(
  {
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },

    count: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Acceptance count must be an integer.",
      },
    },
  },
  {
    timestamps: true,
  }
);

// Only one daily counter per worker per date.
dailyAcceptanceSchema.index(
  { worker: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "DailyAcceptance",
  dailyAcceptanceSchema
);