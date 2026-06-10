const Chat = require('../models/Chat');
const Message = require('../models/Message');

exports.createChat = async (req, res) => {
  const chat = await Chat.create({ user: req.user._id, title: req.body.title || 'New Chat' });
  res.status(201).json(chat);
};

exports.getChats = async (req, res) => {
  const chats = await Chat.find({ user: req.user._id }).sort({ updatedAt: -1 });
  res.json(chats);
};

exports.getChat = async (req, res) => {
  const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
  if (!chat) return res.status(404).json({ message: 'Chat not found' });
  const messages = await Message.find({ chat: chat._id }).sort({ createdAt: 1 });
  res.json({ chat, messages });
};

exports.deleteChat = async (req, res) => {
  const chat = await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!chat) return res.status(404).json({ message: 'Chat not found' });
  await Message.deleteMany({ chat: chat._id });
  res.json({ message: 'Chat deleted' });
};
