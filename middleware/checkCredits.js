const User = require("../models/User");

module.exports = async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const now = new Date();

  // Reset credits automatically
  if (now > user.creditResetAt) {
    user.creditUsed = 0;

    if (user.plan === "free") {
      user.creditLimit = 10;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      user.creditResetAt = tomorrow;
    }

    if (user.plan === "premium") {
      user.creditLimit = 300;

      const nextMonth = new Date();

      nextMonth.setMonth(nextMonth.getMonth() + 1);

      user.creditResetAt = nextMonth;
    }

    if (user.plan === "premium_pro") {
      user.creditLimit = 1000;

      const nextMonth = new Date();

      nextMonth.setMonth(nextMonth.getMonth() + 1);

      user.creditResetAt = nextMonth;
    }

    await user.save();
  }

  if (user.creditUsed >= user.creditLimit) {
    return res.status(403).json({
      message: "You have reached your credit limit. Please upgrade your plan.",
    });
  }

  req.userData = user;

  next();
};
