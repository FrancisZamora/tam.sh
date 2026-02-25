export interface Segment {
  id: string;
  name: string;
  count: number;
  color: string;
}

export interface TAMData {
  title: string;
  totalPopulation: number;
  dotCount: number;
  segments: Segment[];
}

export const DEFAULT_TAM_DATA: TAMData = {
  title: "World Population by AI Usage",
  totalPopulation: 8_100_000_000,
  dotCount: 2500,
  segments: [
    {
      id: "never-used",
      name: "Never used AI",
      count: 6_800_000_000,
      color: "#6b7280",
    },
    {
      id: "free-chatbot",
      name: "Free chatbot user",
      count: 1_300_000_000,
      color: "#22c55e",
    },
    {
      id: "pays-20",
      name: "Pays $20/mo for AI",
      count: 20_000_000,
      color: "#f59e0b",
    },
    {
      id: "coding-scaffold",
      name: "Uses coding scaffold",
      count: 3_500_000,
      color: "#ef4444",
    },
  ],
};

// ── Population base presets ─────────────────────────────────

export interface PopulationPreset {
  label: string;
  value: number;
}

export const POPULATION_PRESETS: PopulationPreset[] = [
  { label: "World", value: 8_100_000_000 },
  { label: "US", value: 335_000_000 },
  { label: "EU", value: 450_000_000 },
  { label: "China", value: 1_400_000_000 },
  { label: "India", value: 1_400_000_000 },
  { label: "Brazil", value: 215_000_000 },
  { label: "UK", value: 67_000_000 },
];

// ── Legacy preset populations (used in dropdown) ────────────

export interface PresetPopulation {
  id: string;
  name: string;
  totalPopulation: number;
  segments: Segment[];
}

export const PRESET_POPULATIONS: PresetPopulation[] = [
  {
    id: "preset-world-ai",
    name: "World Population — AI Usage",
    totalPopulation: 8_100_000_000,
    segments: DEFAULT_TAM_DATA.segments,
  },
  {
    id: "preset-us-saas",
    name: "US SaaS Market",
    totalPopulation: 335_000_000,
    segments: [
      { id: "no-saas", name: "No SaaS usage", count: 200_000_000, color: "#6b7280" },
      { id: "free-tier", name: "Free tier users", count: 80_000_000, color: "#22c55e" },
      { id: "smb-paid", name: "SMB paid ($50-200/mo)", count: 40_000_000, color: "#3b82f6" },
      { id: "enterprise", name: "Enterprise ($1K+/mo)", count: 15_000_000, color: "#f59e0b" },
    ],
  },
  {
    id: "preset-global-ecommerce",
    name: "Global E-commerce",
    totalPopulation: 8_100_000_000,
    segments: [
      { id: "no-internet", name: "No internet access", count: 2_600_000_000, color: "#6b7280" },
      { id: "online-no-buy", name: "Online, never buys", count: 2_500_000_000, color: "#9ca3af" },
      { id: "occasional", name: "Occasional buyer", count: 2_000_000_000, color: "#22c55e" },
      { id: "frequent", name: "Frequent buyer (1x/week+)", count: 800_000_000, color: "#3b82f6" },
      { id: "power-shopper", name: "Power shopper ($500+/mo)", count: 200_000_000, color: "#f59e0b" },
    ],
  },
];
