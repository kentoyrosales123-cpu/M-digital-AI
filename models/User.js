const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      index: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    plan: {
      type: String,
      enum: ["free", "premium", "premium_pro"],
      default: "free",
    },

    creditUsed: {
      type: Number,
      default: 0,
    },

    creditLimit: {
      type: Number,
      default: 10,
    },

    creditResetAt: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date;
      },
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
