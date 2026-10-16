const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    feedback: { type: String, trim: true },
  },
  { timestamps: true }
);

reviewSchema.index({ ticket: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
