const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Subscription = require("../models/Subscription");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });
  const exists = await User.findOne({ email });
  if (exists)
    return res.status(400).json({ message: "Email already registered" });
  const user = await User.create({ name, email, password, role: "user" });
  await Subscription.create({ user: user._id, plan: "free", status: "active" });
  res.status(201).json({ token: signToken(user._id), user: safeUser(user) });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: "Invalid credentials" });
  if (user.status !== "active")
    return res.status(403).json({ message: "Account is inactive" });
  res.json({ token: signToken(user._id), user: safeUser(user) });
};

exports.me = async (req, res) => {
  // Auto-fix old free users
  if (req.user.plan === "free" && req.user.creditLimit !== 30) {
    req.user.creditLimit = 30;
    await req.user.save();
  }

  const subscription = await Subscription.findOne({
    user: req.user._id,
  });

  res.json({
    user: safeUser(req.user),
    subscription,
  });
};

function safeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,

    plan: user.plan,

    creditUsed: user.creditUsed,

    creditLimit: user.creditLimit,

    creditRemaining: user.creditLimit - user.creditUsed,

    creditResetAt: user.creditResetAt,
  };
}
