require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Subscription = require('./models/Subscription');

async function run() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing');
  await mongoose.connect(process.env.MONGO_URI);
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  let admin = await User.findOne({ email });
  if (admin) {
    console.log('Admin already exists:', email);
    process.exit(0);
  }
  admin = await User.create({
    name: process.env.ADMIN_NAME || 'Admin',
    email,
    password: process.env.ADMIN_PASSWORD || 'Admin12345',
    role: 'admin',
    status: 'active'
  });
  await Subscription.create({ user: admin._id, plan: 'premium', status: 'active', startDate: new Date() });
  console.log('Admin created:', email);
  process.exit(0);
}
run().catch(err => { console.error(err); process.exit(1); });
