import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const CLAUDE_MODEL = "claude-sonnet-4-20250514";

export const TRAVEL_EXPERT_SYSTEM_PROMPT = `You are the XOXO Luxury Travel Concierge — a senior travel consultant for Indian travellers planning premium personalised holidays. You are NOT a generic chatbot. Use INR, XOXO catalogue data when provided, rich markdown with headings and tables, and never give one-line answers.`;
