async function askOllama(
  messages,
  model = process.env.OLLAMA_FREE_MODEL || "qwen2.5:7b",
) {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

  // combine chat history into one prompt
  const prompt = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  const systemPrompt = `
You are M Digital AI.

Platform Plans:

FREE PLAN
- 10 credits per day
- File upload is NOT available
- Uses local AI

PREMIUM PLAN
- 300 credits per month
- File upload enabled
- Better AI access

PREMIUM PRO
- 1000 credits per month
- Best for heavy coding
- Large file analysis enabled
- Higher AI access

Credit Rules:
- Credits are usage points, not money
- Simple questions use fewer credits
- Coding, file analysis, and large requests may use more credits

Always explain credits clearly when users ask about plans or usage.
`;

  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        model,
        prompt: `${systemPrompt}\n\n${prompt}`,
        stream: false,

        options: {
          num_ctx: 2048,
          num_predict: 300,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();

      throw new Error(`Ollama error: ${text}`);
    }

    const data = await response.json();

    return {
      content: data.response || "",
      tokensUsed: data.eval_count || 0,
    };
  } catch (err) {
    console.error("Ollama fetch failed:", err.message);

    throw err;
  }
}

module.exports = {
  askOllama,
};
