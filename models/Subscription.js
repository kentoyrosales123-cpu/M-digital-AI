const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    plan: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "expired", "pending"],
      default: "active",
      index: true,
    },
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
