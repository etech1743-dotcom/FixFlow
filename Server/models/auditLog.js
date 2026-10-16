const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    targetType: String,
    targetId: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
