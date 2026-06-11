const Chat = require("../models/Chat");
const Message = require("../models/Message");
const Subscription = require("../models/Subscription");
const { chooseModel } = require("../services/modelRouter");
const { askOllama } = require("../services/ollamaService");
const { askOpenAI } = require("../services/openaiService");

exports.sendMessage = async (req, res) => {
  const { chatId, message } = req.body;
  if (!message || !message.trim())
    return res.status(400).json({ message: "Message is required" });

  let chat = chatId
    ? await Chat.findOne({ _id: chatId, user: req.user._id })
    : null;
  if (chatId && !chat)
    return res.status(404).json({ message: "Chat not found" });
  if (!chat)
    chat = await Chat.create({
      user: req.user._id,
      title: message.slice(0, 40),
    });

  const sub = (await Subscription.findOne({ user: req.user._id })) || {
    plan: "free",
    status: "active",
  };
  const plan =
    sub.plan === "premium" &&
    sub.status === "active" &&
    (!sub.endDate || sub.endDate > new Date())
      ? "premium"
      : "free";
  const route = chooseModel(message, plan);
  const creditCost = getCreditCost(route.difficulty, req.user.plan);
  try {
    await enforceCreditLimit(req.user, creditCost);
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message,
      resetTime: err.resetTime,
    });
  }

  await Message.create({
    chat: chat._id,
    user: req.user._id,
    role: "user",
    content: message,
  });
  const history = await Message.find({ chat: chat._id })
    .sort({ createdAt: 1 })
    .limit(8);
  const aiMessages = history.map((m) => ({ role: m.role, content: m.content }));

  let result;

  try {
    result =
      route.provider === "ollama"
        ? await askOllama(aiMessages, route.model)
        : await askOpenAI(aiMessages, route.model);
  } catch (err) {
    console.error("AI Error:", err);

    return res.status(500).json({
      message: "AI service is temporarily unavailable. Please try again.",
    });
  }

  const assistantMsg = await Message.create({
    chat: chat._id,
    user: req.user._id,
    role: "assistant",
    content: result.content,
    modelUsed: route.label,
    tokensUsed: result.tokensUsed,
  });

  if (chat.title === "New Chat") {
    chat.title = message.slice(0, 40);
    await chat.save();
  } else {
    chat.updatedAt = new Date();
    await chat.save();
  }

  res.json({
    chat,
    assistant: assistantMsg,
    model: route.label,
    difficulty: route.difficulty,
    creditCost,
  });
};

function getCreditCost(difficulty, plan) {
  const creditTable = {
    free: {
      easy: 1,
      average: 1,
      difficult: 2,
      very_difficult: 3,
    },

    premium: {
      easy: 1,
      average: 2,
      difficult: 3,
      very_difficult: 5,
    },

    premium_pro: {
      easy: 1,
      average: 1,
      difficult: 2,
      very_difficult: 3,
    },
  };

  return creditTable[plan]?.[difficulty] || 1;
}

async function enforceCreditLimit(user, creditCost = 1) {
  const now = new Date();
  // Auto-fix old users
  if (user.plan === "free" && user.creditLimit !== 30) {
    user.creditLimit = 30;
    await user.save();
  }

  // Reset credits automatically
  if (now >= user.creditResetAt) {
    user.creditUsed = 0;

    // FREE PLAN
    // FREE PLAN
    if (user.plan === "free") {
      user.creditLimit = 30;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      user.creditResetAt = tomorrow;
    }

    // PREMIUM
    else if (user.plan === "premium") {
      user.creditLimit = 300;

      const nextMonth = new Date();

      nextMonth.setMonth(nextMonth.getMonth() + 1);

      user.creditResetAt = nextMonth;
    }

    // PREMIUM PRO
    else if (user.plan === "premium_pro") {
      user.creditLimit = 1000;

      const nextMonth = new Date();

      nextMonth.setMonth(nextMonth.getMonth() + 1);

      user.creditResetAt = nextMonth;
    }

    await user.save();
  }

  // No credits left
  if (user.creditUsed + creditCost > user.creditLimit) {
    const err = new Error("You have reached your credit limit.");

    err.status = 429;

    err.resetTime = user.creditResetAt;

    throw err;
  }

  // Deduct 1 credit
  user.creditUsed += creditCost;

  await user.save();
}
