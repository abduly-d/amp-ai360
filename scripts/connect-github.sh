#!/usr/bin/env bash
# Connect this project to GitHub and push it.
# Prerequisite (run once, opens your browser):  gh auth login
# Usage:   ./scripts/connect-github.sh [repo-name] [--public]
set -euo pipefail

export PATH="/opt/homebrew/bin:$PATH"
cd "$(dirname "$0")/.."

REPO="${1:-amp-ai360}"
VIS="--private"
[[ "${2:-}" == "--public" ]] && VIS="--public"

if ! command -v gh >/dev/null 2>&1; then
  echo "❌ GitHub CLI (gh) not found. Install it with:  brew install gh"; exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "🔑 You are not signed in to GitHub. Run this once (opens your browser):"
  echo "     gh auth login"
  echo "   then re-run this script."; exit 1
fi

USER_LOGIN="$(gh api user --jq .login)"
echo "✅ Signed in as: $USER_LOGIN"

if git remote get-url origin >/dev/null 2>&1; then
  echo "ℹ️  Remote 'origin' already set: $(git remote get-url origin)"
  git push -u origin main
else
  echo "📦 Creating $VIS repo '$USER_LOGIN/$REPO' and pushing…"
  gh repo create "$REPO" $VIS --source=. --remote=origin --push
fi

echo ""
echo "🎉 Done. Repository: https://github.com/$USER_LOGIN/$REPO"
echo "   Next: deploy with Vercel →  ./scripts/deploy-vercel.sh   (after 'vercel login')"
