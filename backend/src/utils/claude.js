const Anthropic = require("@anthropic-ai/sdk");

let client = null;

const getClaude = () => {
  if (client) return client;
  client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
};

const CLAUDE_MODEL = "claude-sonnet-4-20250514";

const { LUXURY_CONCIERGE_SYSTEM } = require("../constants/concierge-prompts");

/** @deprecated use LUXURY_CONCIERGE_SYSTEM */
const TRAVEL_EXPERT_SYSTEM = LUXURY_CONCIERGE_SYSTEM;

module.exports = { getClaude, CLAUDE_MODEL, TRAVEL_EXPERT_SYSTEM, LUXURY_CONCIERGE_SYSTEM };
