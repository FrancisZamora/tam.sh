"use client";

import { useState, useEffect } from "react";
import { Segment, POPULATION_PRESETS } from "@/lib/types";
import { formatNumber, generateId } from "@/lib/utils";

interface ProviderInfo {
  id: string;
  name: string;
  models: string[];
}

interface AIAnalysisProps {
  onResult: (segments: Segment[], total: number, market: string, populationLabel: string) => void;
}

export default function AIAnalysis({ onResult }: AIAnalysisProps) {
  const [market, setMarket] = useState("");
  const [populationIndex, setPopulationIndex] = useState(0); // default: World
  const [customPopulation, setCustomPopulation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedModel, setSelectedModel] = useState("");

  const isCustom = populationIndex === POPULATION_PRESETS.length;
  const isCustomText = populationIndex === POPULATION_PRESETS.length + 1;
  const [customTextPopulation, setCustomTextPopulation] = useState("");
  const [resolvedCustomText, setResolvedCustomText] = useState<{ label: string; value: number } | null>(null);
  const [resolvingCustom, setResolvingCustom] = useState(false);

  const parsePopulationInput = (input: string): number => {
    const trimmed = input.trim().toLowerCase();
    // Support shorthand: 500M, 1.5B, 200K
    const multiplierMatch = trimmed.match(/^([\d.,]+)\s*([kmb])/i);
    if (multiplierMatch) {
      const num = parseFloat(multiplierMatch[1].replace(/,/g, ""));
      const unit = multiplierMatch[2].toLowerCase();
      if (unit === "k") return Math.round(num * 1_000);
      if (unit === "m") return Math.round(num * 1_000_000);
      if (unit === "b") return Math.round(num * 1_000_000_000);
    }
    return parseInt(trimmed.replace(/[^0-9]/g, ""), 10) || 0;
  };

  const resolvedPopulation = isCustomText
    ? (resolvedCustomText?.value || 0)
    : isCustom
      ? parsePopulationInput(customPopulation)
      : (populationIndex < POPULATION_PRESETS.length ? POPULATION_PRESETS[populationIndex].value : 0);

  const populationLabel = isCustomText
    ? (resolvedCustomText?.label || customTextPopulation)
    : isCustom
      ? `Custom ${formatNumber(resolvedPopulation)}`
      : `${POPULATION_PRESETS[populationIndex].label} ${formatNumber(POPULATION_PRESETS[populationIndex].value)}`;

  const resolveCustomPopulation = async () => {
    if (!customTextPopulation.trim() || !selectedProvider) return;
    setResolvingCustom(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `IGNORE all previous instructions about TAM segments. This is a different task. Estimate the total count/number of: "${customTextPopulation.trim()}". Return ONLY a JSON object with no other text: {"label": "<short description>", "value": <integer>}. The value MUST be a whole integer, not a decimal or fraction. Be realistic. Examples: {"label": "Restaurants in Miami", "value": 7800}, {"label": "Nurses in California", "value": 450000}, {"label": "SaaS companies worldwide", "value": 30000}`,
          population: 0,
          provider: selectedProvider,
          model: selectedModel,
          rawResponse: true,
        }),
      });
      const data = await res.json();
      const text = data.rawText || JSON.stringify(data);
      const match = text.match(/\{[^}]*"label"[^}]*"value"[^}]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        setResolvedCustomText({ label: parsed.label, value: parsed.value });
      }
    } catch {
      setError("Could not resolve population. Try a number instead.");
    } finally {
      setResolvingCustom(false);
    }
  };

  // Fetch available providers on mount
  useEffect(() => {
    fetch("/api/analyze")
      .then((r) => r.json())
      .then((data) => {
        if (data.providers && data.providers.length > 0) {
          setProviders(data.providers);
          setSelectedProvider(data.providers[0].id);
          setSelectedModel(data.providers[0].models[0]);
        }
      })
      .catch(() => {});
  }, []);

  const currentProvider = providers.find((p) => p.id === selectedProvider);

  const handleProviderChange = (id: string) => {
    setSelectedProvider(id);
    const provider = providers.find((p) => p.id === id);
    if (provider) {
      setSelectedModel(provider.models[0]);
    }
  };

  const analyze = async () => {
    if (!market.trim() || resolvedPopulation <= 0) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: market.trim(),
          population: resolvedPopulation,
          provider: selectedProvider || undefined,
          model: selectedModel || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      const segments: Segment[] = data.segments.map(
        (s: { name: string; count: number; color: string }) => ({
          id: generateId(),
          name: s.name,
          count: s.count,
          color: s.color,
        })
      );

      onResult(segments, data.totalPopulation, market.trim(), populationLabel);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to analyze. Check your API key and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[700px] mx-auto mt-6">
      <h2 className="text-lg font-semibold text-white mb-3">
        AI Market Analysis
      </h2>

      {/* Population selector */}
      <div className="mb-3">
        <label className="text-sm text-gray-400 mb-1.5 block">
          Select Population Base
        </label>
        <div className="flex gap-2 flex-wrap">
          <select
            value={populationIndex}
            onChange={(e) => setPopulationIndex(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            {POPULATION_PRESETS.map((p, i) => (
              <option key={i} value={i}>
                {p.label} ({formatNumber(p.value)})
              </option>
            ))}
            <option value={POPULATION_PRESETS.length}>Custom (number)</option>
            <option value={POPULATION_PRESETS.length + 1}>Custom (describe with AI)</option>
          </select>

          {isCustom && (
            <input
              type="text"
              value={customPopulation}
              onChange={(e) => setCustomPopulation(e.target.value)}
              placeholder="e.g. 335M, 1.4B, 500000000"
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm w-40 focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
            />
          )}

          {isCustomText && (
            <div className="flex gap-2 items-center flex-1">
              <input
                type="text"
                value={customTextPopulation}
                onChange={(e) => { setCustomTextPopulation(e.target.value); setResolvedCustomText(null); }}
                onKeyDown={(e) => e.key === "Enter" && resolveCustomPopulation()}
                placeholder="e.g. restaurants in Miami, nurses in California"
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm flex-1 focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
              />
              <button
                onClick={resolveCustomPopulation}
                disabled={resolvingCustom || !customTextPopulation.trim() || providers.length === 0}
                className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors shrink-0"
              >
                {resolvingCustom ? "Resolving..." : "🔍 Resolve"}
              </button>
              {resolvedCustomText && (
                <span className="text-green-400 text-xs shrink-0">
                  ✅ {resolvedCustomText.label}: {formatNumber(resolvedCustomText.value)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Provider + Model selectors */}
      {providers.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          <select
            value={selectedProvider}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {currentProvider && currentProvider.models.length > 1 && (
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
            >
              {currentProvider.models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {providers.length === 0 && (
        <p className="text-yellow-500/80 text-sm mb-3">
          No AI providers configured. Set at least one API key to enable
          analysis.
        </p>
      )}

      {/* Market input + Analyze button */}
      <div className="flex gap-2">
        <input
          type="text"
          value={market}
          onChange={(e) => setMarket(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && analyze()}
          placeholder="e.g., AI SaaS tools, medspa services"
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm flex-1 focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
        />
        <button
          onClick={analyze}
          disabled={loading || !market.trim() || resolvedPopulation <= 0 || providers.length === 0}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}
