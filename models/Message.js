const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  modelUsed: String,
  tokensUsed: Number
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
