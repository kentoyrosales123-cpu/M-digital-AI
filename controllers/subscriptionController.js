const Subscription = require('../models/Subscription');
const PaymentProof = require('../models/PaymentProof');

exports.mySubscription = async (req, res) => {
  let subscription = await Subscription.findOne({ user: req.user._id });
  if (!subscription) subscription = await Subscription.create({ user: req.user._id, plan: 'free', status: 'active' });
  res.json(subscription);
};

exports.uploadPaymentProof = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Payment screenshot is required' });
  const proof = await PaymentProof.create({
    user: req.user._id,
    amount: Number(req.body.amount || 199),
    referenceNumber: req.body.referenceNumber || '',
    screenshotPath: `/uploads/payment-proofs/${req.file.filename}`
  });
  await Subscription.findOneAndUpdate(
    { user: req.user._id },
    { plan: 'free', status: 'pending' },
    { upsert: true, new: true }
  );
  res.status(201).json({ message: 'Payment proof uploaded. Please wait for admin approval.', proof });
};
