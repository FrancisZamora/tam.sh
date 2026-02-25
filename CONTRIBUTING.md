# Contributing to TAM Visualizer

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your API keys
4. Run the dev server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000)

## Making Changes

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all checks pass:
   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```
4. Submit a pull request

## Project Structure

```
src/
├── app/           # Next.js App Router pages + API routes
├── components/    # React components
├── lib/           # Shared utilities, types, provider logic
└── __tests__/     # Jest test files
```

## Adding a New AI Provider

1. Add the provider config to `src/lib/providers.ts` (PROVIDERS array)
2. Implement the query function following the existing pattern
3. Add the env var to `.env.example`
4. Add tests in `src/__tests__/analyze.test.ts`

## Code Style

- TypeScript strict mode
- ESLint with Next.js config
- No unnecessary abstractions — keep it simple
- Tests for new features

## Reporting Issues

Please use GitHub Issues and include:
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS info if relevant
