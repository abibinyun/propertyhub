# Next.js Guidelines for AI Agents

See root [AGENTS.md](../../AGENTS.md) and [docs/FRONTEND_GUIDELINES.md](../../docs/FRONTEND_GUIDELINES.md) for full authoritative rules.

Next.js 16 conventions:
- Next.js is **UI layer only**; never place database or business logic here.
- Default to React Server Components. Use `"use client"` only for interaction.
- Import `API_URL` and `APP_URL` from `@/lib/config`.
- Import domain models and types from `@propertyhub/shared`.
