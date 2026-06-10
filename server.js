require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/ai', rateLimit({ windowMs: 60 * 1000, max: 40 }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/subscription', require('./routes/subscriptionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'landing.html')));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`M Digital AI Assistant running on port ${PORT}`));
