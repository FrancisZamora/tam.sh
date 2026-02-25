import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import OpenAI from "openai";

export type ProviderId = "anthropic" | "groq" | "openai" | "grok";

export interface Provider {
  id: ProviderId;
  name: string;
  models: string[];
  envKey: string;
}

export const PROVIDERS: Provider[] = [
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    models: ["claude-opus-4-20250514", "claude-sonnet-4-20250514", "claude-haiku-4-20250414", "claude-3.5-sonnet-20241022"],
    envKey: "ANTHROPIC_API_KEY",
  },
  {
    id: "groq",
    name: "Groq (Llama / Mixtral)",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    envKey: "GROQ_API_KEY",
  },
  {
    id: "openai",
    name: "OpenAI (GPT)",
    models: ["gpt-4.1", "gpt-4.1-mini", "gpt-4.1-nano", "gpt-4o", "gpt-4o-mini", "o3-mini"],
    envKey: "OPENAI_API_KEY",
  },
  {
    id: "grok",
    name: "Grok (xAI)",
    models: ["grok-3", "grok-3-mini"],
    envKey: "XAI_API_KEY",
  },
];

export function getAvailableProviders(): Provider[] {
  return PROVIDERS.filter((p) => !!process.env[p.envKey]);
}

const SYSTEM_PROMPT = `You are a market analysis expert. You will be given a population base and a market description. Your job is to break the ENTIRE population into segments that show how tiny the real addressable market is within the total population.

CRITICAL: Segments MUST sum to EXACTLY the total population number provided. The population is the whole — you are showing what fraction of it is your actual TAM.

Return ONLY valid JSON with this exact structure:
{
  "totalPopulation": <number>,
  "segments": [
    { "name": "<segment name>", "count": <number>, "color": "<hex color>" }
  ]
}

Rules:
- Use 3-6 segments. The largest segment should be "Not in market" or similar — the majority of the population.
- Use distinct hex colors. Use gray (#6b7280) for the "not in market" segment.
- Segments MUST sum to EXACTLY the totalPopulation number provided.
- Order from largest to smallest.
- Be realistic with numbers based on real market data.
- The point is to show how small the real TAM is compared to the total population.`;

export async function queryProvider(
  providerId: ProviderId,
  model: string,
  query: string
): Promise<string> {
  switch (providerId) {
    case "anthropic":
      return queryAnthropic(model, query);
    case "groq":
      return queryGroq(model, query);
    case "openai":
      return queryOpenAI(model, query);
    case "grok":
      return queryGrok(model, query);
    default:
      throw new Error(`Unknown provider: ${providerId}`);
  }
}

async function queryAnthropic(model: string, query: string): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.messages.create({
    model,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: query }],
  });
  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

async function queryGroq(model: string, query: string): Promise<string> {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: query },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });
  return completion.choices[0]?.message?.content || "";
}

async function queryOpenAI(model: string, query: string): Promise<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: query },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });
  return completion.choices[0]?.message?.content || "";
}

async function queryGrok(model: string, query: string): Promise<string> {
  const client = new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: "https://api.x.ai/v1",
  });
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: query },
    ],
    temperature: 0.3,
    max_tokens: 1024,
  });
  return completion.choices[0]?.message?.content || "";
}
