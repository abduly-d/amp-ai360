# AMP AI360 — Tanzania Agriculture Master Plan platform

Working application for the Agriculture Transformation Office and its stakeholders
(MoA, MLF, development partners, and ministry leadership). It tracks AMP 2050
delivery: indicators, the 15 flagships, priority commodities, regions, institutions,
CAADP alignment, the decision room, and investments.

The public site is a **Next.js 14** app for **Vercel**, with **Neon Postgres** when
`DATABASE_URL` or `POSTGRES_URL` is set. Without a database it still runs, using the
seeded dataset in memory (and a local `.data/store.json` file in development).

GitHub Pages previously published a static HTML export. That workflow is disabled.
The static file under `share/` is kept only as a legacy artifact.

## Quick start

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open http://localhost:3000. With no database URL and no `EDITOR_PASSWORD`, the app
is readable and edits stay off. Set `EDITOR_PASSWORD` to sign in and change data.

```bash
npm test
npm run build
```

## What you can do

- Read every view without an account.
- Sign in with the editor password and a display name. The session is an HTTP-only
  signed cookie. There is one editor role today, with room to add more later.
- Create, edit, and delete records, including a yearly indicator actual or a
  flagship progress entry for a period, each with a short note and source.
- Download a CSV template, export the current rows, and import a file. A file with
  any invalid row is rejected as a whole.
- Read the audit log (who, when, what, before and after).
- Search from the header. Filter by year, region, and flagship.
- Print the Executive brief for a meeting.
- Ask the assistant. It grounds answers in the knowledge base and the live dataset.

The sidebar groups the workspace: Overview, Delivery, Markets, Geography,
Alignment, and Data. The Kilimo green / gold / blue palette and light/dark themes
stay.

## Architecture

```
app/(portal)          Sidebar shell and pages
app/api/records       CRUD, CSV import, export, template
app/api/domain        Snapshot used by the pages
app/api/audit         Audit log
app/api/auth          Password session
app/api/health        Database mode and AI provider status
app/api/ai            Search and RAG analysis (unchanged paths)
app/api/data          Existing metrics and TMX routes
lib/domain            Dataset contracts, validation, seed, snapshot
lib/store             Postgres (Neon serverless) and in-memory fallback
lib/import            CSV parse and validation
lib/ai                Provider chain, then the local engine
```

On startup the Postgres store runs `CREATE TABLE IF NOT EXISTS` and, once, loads
the current `lib/data` figures. That seed uses `ON CONFLICT DO NOTHING`, so later
edits are not overwritten. If the database is empty after that, pages show empty
states instead of crashing. If the database cannot be reached, the app falls back
to the seeded in-memory data and says so.

Neon hostnames use the Neon serverless HTTP driver. Any other Postgres URL,
including a local database, uses the standard Postgres wire protocol.

Seed figures are the public AMP 2050 baselines already in this repository.
Commodity price paths and several operational scores are illustrative placeholders,
not confidential ATO or AGRA working papers.

## Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` or `POSTGRES_URL` | Neon (or any Postgres the Neon serverless driver can reach). Blank = local dataset. |
| `EDITOR_PASSWORD` | Shared editor password. Unset = editing disabled. |
| `SESSION_SECRET` | Cookie signing key. Defaults to `EDITOR_PASSWORD`. |
| `AI_PROVIDER` | Comma-separated chain, for example `pawa` or `anthropic,pawa`. |
| `PAWA_AI_API_KEY` | Pawa AI bearer token. |
| `PAWA_MODEL` | Defaults to `pawa-v1-blaze-20250318`. |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | Anthropic Messages API. |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | OpenAI chat completions. |
| `AMP_GPT_INSTRUCTIONS` | Optional persona prepended to the assistant prompt. |

Pawa is called at `POST https://api.pawa-ai.com/v1/chat/request`. Message content is
a list of `{type:'text', text}` blocks, and user/assistant turns alternate. If a
provider is missing, errors, or returns an unreadable body, the next provider is
tried. The deterministic local engine is the last resort. When `AI_PROVIDER` is
unset, the chain is OpenAI, then Anthropic, then Pawa, skipping any without a key.

`GET /api/health` reports the database mode and which AI providers are configured.
It does not return secrets.

## Deploy on Vercel

This is a normal Next.js app (no static export). Create a Vercel project from the
repository, attach a Neon database, and set the environment variables above for
Production. Do not commit `.env.local`.

The GitHub Pages workflow (`.github/workflows/pages.yml`) no longer runs on pushes
to `main`. Production hosting is Vercel.

## Tests

`npm test` covers the in-memory store (seed, CRUD, audit, period upserts), CSV
parsing and validation, session signing, and the AI provider chain including Pawa's
response shapes.
