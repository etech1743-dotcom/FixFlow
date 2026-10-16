const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    fromStatus: String,
    toStatus: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

activitySchema.index({ ticket: 1, createdAt: 1 });

module.exports = mongoose.model("Activity", activitySchema);
