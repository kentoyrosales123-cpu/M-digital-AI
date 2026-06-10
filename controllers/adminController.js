const User = require("../models/User");
const Chat = require("../models/Chat");
const Message = require("../models/Message");
const Subscription = require("../models/Subscription");
const PaymentProof = require("../models/PaymentProof");

exports.dashboard = async (req, res) => {
  const [totalUsers, premiumUsers, totalChats, totalMessages, pendingPayments] =
    await Promise.all([
      User.countDocuments({ role: "user" }),
      Subscription.countDocuments({ plan: "premium", status: "active" }),
      Chat.countDocuments(),
      Message.countDocuments(),
      PaymentProof.countDocuments({ status: "pending" }),
    ]);
  res.json({
    totalUsers,
    premiumUsers,
    totalChats,
    totalMessages,
    pendingPayments,
  });
};

exports.getUsers = async (req, res) => {
  const users = await User.find()
    .select("name email role status plan creditResetAt createdAt")
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  const now = new Date();

  const updatedUsers = await Promise.all(
    users.map(async (user) => {
      if (
        user.plan !== "free" &&
        user.creditResetAt &&
        new Date(user.creditResetAt) <= now
      ) {
        await User.findByIdAndUpdate(user._id, {
          plan: "free",
          creditUsed: 0,
          creditLimit: 10,
          creditResetAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        });

        user.plan = "free";
      }

      return user;
    }),
  );

  res.json(updatedUsers);
};

exports.updateUserStatus = async (req, res) => {
  const { status } = req.body;
  if (!["active", "inactive"].includes(status))
    return res.status(400).json({ message: "Invalid status" });
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  ).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};

exports.getPayments = async (req, res) => {
  const payments = await PaymentProof.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  res.json(payments);
};

exports.approvePayment = async (req, res) => {
  const payment = await PaymentProof.findById(req.params.id);

  if (!payment) {
    return res.status(404).json({
      message: "Payment not found",
    });
  }

  // approve payment
  payment.status = "approved";
  payment.adminNote = req.body.adminNote || "";

  payment.reviewedAt = new Date();

  await payment.save();

  // subscription dates
  const startDate = new Date();

  const endDate = new Date();

  endDate.setMonth(endDate.getMonth() + 1);

  // determine plan
  const isPro = payment.amount >= 500;

  const userPlan = isPro ? "premium_pro" : "premium";

  const creditLimit = isPro ? 1000 : 300;

  // update subscription
  await Subscription.findOneAndUpdate(
    { user: payment.user },
    {
      plan: userPlan,
      status: "active",
      startDate,
      endDate,
    },
    {
      upsert: true,
      new: true,
    },
  );

  // IMPORTANT:
  // update actual user credits
  await User.findByIdAndUpdate(payment.user, {
    plan: userPlan,
    creditUsed: 0,
    creditLimit,
    creditResetAt: endDate,
  });

  res.json({
    message: `${userPlan.replace("_", " ")} activated successfully`,
    payment,
  });
};

exports.rejectPayment = async (req, res) => {
  const payment = await PaymentProof.findById(req.params.id);

  if (!payment) {
    return res.status(404).json({
      message: "Payment not found",
    });
  }

  payment.status = "rejected";
  payment.adminNote = req.body.adminNote || "";

  payment.reviewedAt = new Date();

  await payment.save();

  // reset subscription
  await Subscription.findOneAndUpdate(
    { user: payment.user },
    {
      plan: "free",
      status: "active",
    },
    {
      upsert: true,
    },
  );

  // IMPORTANT:
  // reset user to free plan
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  await User.findByIdAndUpdate(payment.user, {
    plan: "free",
    creditUsed: 0,
    creditLimit: 10,
    creditResetAt: tomorrow,
  });

  res.json({
    message: "Payment rejected",
    payment,
  });
};
