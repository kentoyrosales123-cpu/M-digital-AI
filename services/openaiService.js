const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function askOpenAI(messages, model) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is missing');
  const completion = await client.chat.completions.create({ model, messages });
  return {
    content: completion.choices[0]?.message?.content || '',
    tokensUsed: completion.usage?.total_tokens || 0
  };
}
module.exports = { askOpenAI };
