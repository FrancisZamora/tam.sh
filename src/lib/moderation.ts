import Groq from "groq-sdk";

export interface ModerationResult {
  flagged: boolean;
  categories: string[];
}

/**
 * Run content through Llama Guard 3 via Groq for content moderation.
 * Returns { flagged: false } if Groq API key is not configured (graceful skip).
 */
export async function moderateContent(
  content: string
): Promise<ModerationResult> {
  if (!process.env.GROQ_API_KEY) {
    return { flagged: false, categories: [] };
  }

  try {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await client.chat.completions.create({
      model: "llama-guard-3-8b",
      messages: [
        {
          role: "user",
          content,
        },
      ],
      temperature: 0,
      max_tokens: 100,
    });

    const result = completion.choices[0]?.message?.content?.trim() || "safe";

    // Llama Guard returns "safe" or "unsafe\n<category>"
    if (result.toLowerCase().startsWith("unsafe")) {
      const lines = result.split("\n");
      const categories = lines.slice(1).filter((l) => l.trim().length > 0);
      return { flagged: true, categories };
    }

    return { flagged: false, categories: [] };
  } catch (error) {
    console.error("Moderation check failed:", error);
    // Fail open — don't block users if moderation service is down
    return { flagged: false, categories: [] };
  }
}
