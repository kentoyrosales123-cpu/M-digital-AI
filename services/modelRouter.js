function detectDifficulty(userMessage = "") {
  const text = userMessage.toLowerCase();

  let score = 0;
  let hasCoding = false;

  // Message length
  if (text.length > 80) score += 1;
  if (text.length > 200) score += 1;

  // Coding keywords
  const codingTerms = [
    "code",
    "coding",
    "program",
    "create system",
    "build system",
    "build website",
    "website",
    "full stack",
    "backend",
    "frontend",
    "server",
    "api",
    "database",
    "mongodb",
    "mysql",
    "express",
    "node",
    "nodejs",
    "node.js",
    "react",
    "jwt",
    "authentication",
    "login",
    "register",
    "bug",
    "fix",
    "error",
    "debug",
    "controller",
    "route",
    "middleware",
    "html",
    "css",
    "javascript",
    "python",
  ];

  // Math
  const mathTerms = [
    "calculus",
    "integral",
    "integrate",
    "derivative",
    "differentiate",
    "differential equation",
    "trigonometry",
    "equation",
    "solve",
    "limit",
    "matrix",
    "laplace",
    "fourier",
  ];

  // Engineering / technical
  const engineeringTerms = [
    "engineering",
    "physics",
    "algorithm",
    "optimization",
    "system design",
  ];

  // Coding gets stronger weight
  codingTerms.forEach((term) => {
    if (text.includes(term)) {
      score += 3;
      hasCoding = true;
    }
  });

  // Math
  mathTerms.forEach((term) => {
    if (text.includes(term)) {
      score += 2;
    }
  });

  // Engineering
  engineeringTerms.forEach((term) => {
    if (text.includes(term)) {
      score += 1;
    }
  });

  // Force coding minimum difficulty
  if (hasCoding && score < 4) {
    score = 4;
  }

  // Final difficulty
  if (score >= 10) return "very_difficult";
  if (score >= 4) return "difficult";
  if (score >= 2) return "average";

  return "easy";
}

function chooseModel(userMessage, userPlan) {
  const difficulty = detectDifficulty(userMessage);

  // FREE
  if (userPlan !== "premium") {
    return {
      provider: "ollama",
      model: process.env.OLLAMA_FREE_MODEL || "qwen2.5:7b",
      label: `Free - ${difficulty}`,
      difficulty,
    };
  }

  // PREMIUM hard tasks
  if (difficulty === "difficult" || difficulty === "very_difficult") {
    return {
      provider: "openai",
      model: process.env.OPENAI_ADVANCED_MODEL || "gpt-5",
      label: `Premium Advanced - ${difficulty}`,
      difficulty,
    };
  }

  // PREMIUM normal
  return {
    provider: "openai",
    model: process.env.OPENAI_CHEAP_MODEL || "gpt-4.1-mini",
    label: `Premium General - ${difficulty}`,
    difficulty,
  };
}

module.exports = {
  chooseModel,
};
