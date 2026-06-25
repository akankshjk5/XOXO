const Anthropic = require("@anthropic-ai/sdk");

let client = null;

const getClaude = () => {
  if (client) return client;
  client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
};

const CLAUDE_MODEL = "claude-sonnet-4-20250514";

const TRAVEL_EXPERT_SYSTEM = `You are XOXO, an expert AI travel concierge for Indian travellers.
You help plan trips, suggest destinations, give visa info, and recommend packages.
Be friendly, concise, and helpful. Always give prices in INR. Focus on value for Indian travellers.`;

module.exports = { getClaude, CLAUDE_MODEL, TRAVEL_EXPERT_SYSTEM };
