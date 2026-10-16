const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket" },
    type: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
