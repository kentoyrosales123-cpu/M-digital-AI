const OpenAI = require("openai");
const { askOllama } = require("./ollamaService");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function askOpenAI(messages, model) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is missing");
    }

    const completion = await client.chat.completions.create({
      model,
      messages,
    });

    return {
      content: completion.choices[0]?.message?.content || "",
      tokensUsed: completion.usage?.total_tokens || 0,
      provider: "openai",
    };
  } catch (err) {
    console.error("OpenAI failed. Switching to Ollama...");
    console.error(err.message);

    // automatic fallback
    const fallbackModel = process.env.OLLAMA_FREE_MODEL || "qwen2.5:7b";

    const result = await askOllama(messages, fallbackModel);

    return {
      ...result,
      provider: "ollama-fallback",
    };
  }
}

module.exports = { askOpenAI };
