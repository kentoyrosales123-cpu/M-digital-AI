function chooseModel(userMessage, userPlan) {
  const text = String(userMessage || "").toLowerCase();
  if (userPlan !== "premium") {
    return {
      provider: "ollama",
      model: process.env.OLLAMA_FREE_MODEL || "qwen2.5:7b",
      label: "Free - Ollama qwen2.5:7b",
    };
  }

  const advancedTerms = [
    "code",
    "error",
    "bug",
    "node.js",
    "nodejs",
    "python",
    "javascript",
    "mongodb",
    "express",
    "react",
    "calculus",
    "integral",
    "differential equation",
    "math",
    "solve",
  ];

  if (advancedTerms.some((term) => text.includes(term))) {
    return {
      provider: "openai",
      model: process.env.OPENAI_ADVANCED_MODEL || "gpt-4.1",
      label: "Premium - Advanced",
    };
  }

  return {
    provider: "openai",
    model: process.env.OPENAI_CHEAP_MODEL || "gpt-4.1-mini",
    label: "Premium - General",
  };
}

module.exports = { chooseModel };
