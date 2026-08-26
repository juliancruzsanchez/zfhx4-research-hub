#!/usr/bin/env bash
# deploy.sh — Deploy Firebase Functions + Firestore rules + seed papers
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
#
# Prerequisites:
#   - Firebase CLI installed (npm i -g firebase-tools)
#   - Logged in: firebase login
#   - GROQ_API_KEY stored in Firebase secrets

set -euo pipefail

echo "📥 Pulling latest code..."
git pull origin main

echo "🔧 Installing function dependencies..."
cd functions
npm install

echo "🔨 Building functions..."
npm run build

cd ..

echo "🔐 Setting GROQ_API_KEY secret (skip if already set)..."
echo "   Run this once manually if you haven't:"
echo "   cd functions && npx firebase functions:secrets:set GROQ_API_KEY"
echo ""

echo "🚀 Deploying functions + Firestore rules..."
npx firebase deploy --only functions,firestore:rules

echo ""
echo "✅ Deploy complete!"
echo ""
echo "To seed papers, run:"
echo "   cd functions && GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json bun run seed"
echo ""
echo "Then click 'Refresh from PubMed' and 'Re-synthesize' in Workspace → Research papers tab."
