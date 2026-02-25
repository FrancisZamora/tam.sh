# TAM — Total Addressable Market Visualizer

[![CI](https://github.com/tiburonclawd-hub/tam/actions/workflows/ci.yml/badge.svg)](https://github.com/tiburonclawd-hub/tam/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Interactive dot-grid visualization of any market's total addressable market. AI-powered analysis with multi-provider support.

## Screenshots

<!-- Add screenshots here -->
<!-- ![TAM Visualizer](./screenshots/main.png) -->

## Features

- **Dot-Grid Visualization** — 2,500 dots proportionally colored by market segment, with hover tooltips
- **Multi-Provider AI Analysis** — Analyze any market using Anthropic (Claude), Groq (Llama/Mixtral), OpenAI (GPT-4), or Grok (xAI)
- **Content Moderation** — Llama Guard 3 via Groq screens AI-generated content for safety
- **Editable Segments** — Full CRUD for market segments: add, edit, recolor, delete
- **Save & Load** — Save named populations to Supabase (authenticated) or localStorage (anonymous)
- **Share** — Generate public share links for saved populations
- **Preset Markets** — Built-in presets: World AI Usage, US SaaS Market, Global E-commerce
- **Authentication** — Supabase auth with email/password

## Quick Start

```bash
# Clone the repo
git clone https://github.com/your-username/tam.git
cd tam

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `GROQ_API_KEY` | **Yes** | Groq API key — **required** for Llama Guard content moderation. No exceptions. Also enables Llama/Mixtral for analysis. Get one free at [console.groq.com](https://console.groq.com) |
| `ANTHROPIC_API_KEY` | Optional | Anthropic API key for Claude models |
| `OPENAI_API_KEY` | Optional | OpenAI API key for GPT models |
| `XAI_API_KEY` | Optional | xAI API key for Grok models |

> ⚠️ **`GROQ_API_KEY` is required.** TAM uses Llama Guard 3 via Groq for content moderation on all AI-generated segments. Without it, the app will not function. Additional providers (Anthropic, OpenAI, Grok) are optional and auto-detected.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migration.sql` via the SQL editor
3. Copy the project URL and anon key to `.env.local`

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # TypeScript type checking
npm test           # Run tests
npm run test:ci    # Run tests with coverage (CI)
```

## Tech Stack

- [Next.js 14](https://nextjs.org/) — React framework
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Tailwind CSS](https://tailwindcss.com/) — Styling
- [Framer Motion](https://www.framer.com/motion/) — Animations
- [Supabase](https://supabase.com/) — Auth + Database
- [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/) — Testing

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Other Platforms

Any platform that supports Next.js will work — just set the environment variables and run `npm run build && npm start`.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)
