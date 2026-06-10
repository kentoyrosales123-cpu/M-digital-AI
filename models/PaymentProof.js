const mongoose = require("mongoose");

const paymentProofSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, default: 199 },
    referenceNumber: { type: String, trim: true },
    screenshotPath: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminNote: String,
    reviewedAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("PaymentProof", paymentProofSchema);
