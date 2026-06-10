async function askOllama(
  messages,
  model = process.env.OLLAMA_FREE_MODEL || "qwen2.5:7b",
) {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

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

  const finalMessages = [
    {
      role: "system",
      content: systemPrompt,
    },
    ...messages,
  ];

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      model,
      messages: finalMessages,
      stream: false,
      keep_alive: "1h",

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
    content: data.message?.content || "",

    tokensUsed: data.eval_count || 0,
  };
}

module.exports = {
  askOllama,
};
