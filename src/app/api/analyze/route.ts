import { NextRequest, NextResponse } from "next/server";
import {
  queryProvider,
  getAvailableProviders,
  PROVIDERS,
  type ProviderId,
} from "@/lib/providers";
import { moderateContent } from "@/lib/moderation";
import { formatNumber } from "@/lib/utils";

export async function GET() {
  const available = getAvailableProviders();
  return NextResponse.json({
    providers: available.map((p) => ({
      id: p.id,
      name: p.name,
      models: p.models,
    })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const { query, population, provider: providerId, model, rawResponse } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query required" }, { status: 400 });
    }

    // Resolve provider — use requested or first available
    const available = getAvailableProviders();
    if (available.length === 0) {
      return NextResponse.json(
        {
          error:
            "No AI provider configured. Set at least one API key: ANTHROPIC_API_KEY, GROQ_API_KEY, OPENAI_API_KEY, or XAI_API_KEY",
        },
        { status: 500 }
      );
    }

    let resolvedProvider = available[0];
    if (providerId) {
      const requested = available.find((p) => p.id === providerId);
      if (!requested) {
        return NextResponse.json(
          { error: `Provider "${providerId}" is not configured` },
          { status: 400 }
        );
      }
      resolvedProvider = requested;
    }

    // Resolve model — use requested or first for provider
    const providerDef = PROVIDERS.find((p) => p.id === resolvedProvider.id)!;
    const resolvedModel =
      model && providerDef.models.includes(model)
        ? model
        : providerDef.models[0];

    // If raw response requested (for population resolution), query directly without TAM system prompt
    if (rawResponse) {
      const content = await queryProvider(
        resolvedProvider.id as ProviderId,
        resolvedModel,
        query
      );
      return NextResponse.json({ rawText: content });
    }

    // Build the user prompt with population context
    const pop = population && typeof population === "number" && population > 0 ? population : 8_100_000_000;
    const userPrompt = `Population base: ${pop.toLocaleString()} (${formatNumber(pop)})
Market: ${query}

Break this population of ${formatNumber(pop)} into segments showing TAM for "${query}". Segments must sum to exactly ${pop}.`;

    // Query the AI provider
    const content = await queryProvider(
      resolvedProvider.id as ProviderId,
      resolvedModel,
      userPrompt
    );

    // Content moderation via Llama Guard
    const moderation = await moderateContent(content);
    if (moderation.flagged) {
      return NextResponse.json(
        {
          error:
            "The AI response was flagged by content moderation for potentially inappropriate content. Please rephrase your query.",
          categories: moderation.categories,
        },
        { status: 422 }
      );
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      ...data,
      provider: resolvedProvider.id,
      model: resolvedModel,
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed. Check your API key and try again." },
      { status: 500 }
    );
  }
}
