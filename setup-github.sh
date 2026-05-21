#!/bin/bash
# setup-github.sh — Connect this project to GitHub
# Run this ONCE after cloning/downloading the project

set -e

echo "🧠 Second Brain — GitHub Setup"
echo "================================"
echo ""

# Check git is initialized
if [ ! -d ".git" ]; then
  echo "Initializing git..."
  git init
  git add -A
  git commit -m "feat: initial Second Brain app"
fi

echo "Step 1: Create a new repo on GitHub"
echo "  → Go to https://github.com/new"
echo "  → Name it: second-brain"
echo "  → Set to Public or Private"
echo "  → Do NOT initialize with README (we have one)"
echo ""
read -p "Paste your GitHub repo URL (e.g. https://github.com/yourname/second-brain): " REPO_URL

if [ -z "$REPO_URL" ]; then
  echo "No URL provided. Exiting."
  exit 1
fi

# Add remote and push
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"
git branch -M main
git push -u origin main

echo ""
echo "✅ Pushed to GitHub: $REPO_URL"
echo ""
echo "Step 2: Add GitHub Secrets (for CI/CD)"
echo "  → Go to: $REPO_URL/settings/secrets/actions"
echo "  → Add: OPENAI_API_KEY  (your OpenAI key)"
echo "  → Add: DOCKER_USERNAME (for deploy workflow)"
echo "  → Add: DOCKER_PASSWORD (for deploy workflow)"
echo ""
echo "Step 3: GitHub Actions CI will run automatically on every push."
echo "  → Check: $REPO_URL/actions"
echo ""
echo "🎉 Done! Your Second Brain is on GitHub."
