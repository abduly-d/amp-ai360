#!/usr/bin/env bash
# Deploy this Next.js app to Vercel (a live, shareable URL).
# Prerequisites (run once each, both open your browser):
#     npm i -g vercel        # install the Vercel CLI
#     vercel login           # sign in to Vercel
# Usage:   ./scripts/deploy-vercel.sh          (preview)
#          ./scripts/deploy-vercel.sh --prod   (production)
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v vercel >/dev/null 2>&1; then
  echo "❌ Vercel CLI not found. Install it with:  npm i -g vercel"; exit 1
fi

# Optional env for higher-fidelity features (safe to leave unset):
#   OPENAI_API_KEY, AMP_GPT_INSTRUCTIONS   → GPT-matched in-dashboard assistant
#   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY        → live Google Map (if added)
# Add them in the Vercel dashboard (Project → Settings → Environment Variables),
# or with:  vercel env add OPENAI_API_KEY

if [[ "${1:-}" == "--prod" ]]; then
  vercel --prod
else
  vercel
fi
