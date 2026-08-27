#!/usr/bin/env bash
# setup-github-deploy.sh
#
# Run this on your GCloud server (or anywhere with `gcloud` + `firebase` CLI).
# It creates a service account with deploy permissions, generates a JSON key,
# and tells you what to paste into GitHub Secrets.
#
# Prerequisites:
#   - gcloud CLI installed and authenticated
#   - Firebase CLI installed and logged in
#
# Usage:
#   chmod +x setup-github-deploy.sh
#   ./setup-github-deploy.sh

set -euo pipefail

PROJECT_ID="zfhx4ai"
SA_NAME="github-deploy"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  Firebase GitHub Actions Deployment Setup"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ── Step 1: Create service account ─────────────────────────────
echo "▸ Step 1: Creating service account..."
if gcloud iam service-accounts describe "$SA_EMAIL" --project="$PROJECT_ID" &>/dev/null; then
  echo "  Service account already exists: $SA_EMAIL"
else
  gcloud iam service-accounts create "$SA_NAME" \
    --display-name="GitHub Actions Deploy" \
    --description="Deploys Firebase Functions and Firestore rules from GitHub Actions" \
    --project="$PROJECT_ID"
  echo "  Created: $SA_EMAIL"
fi
echo ""

# ── Step 2: Grant required roles ──────────────────────────────
echo "▸ Step 2: Granting deploy permissions..."
ROLES=(
  "roles/firebase.admin"
  "roles/iam.serviceAccountUser"
)

for ROLE in "${ROLES[@]}"; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SA_EMAIL" \
    --role="$ROLE" \
    --quiet \
    --condition=None 2>/dev/null
  echo "  ✓ $ROLE"
done
echo ""

# ── Step 3: Generate JSON key ──────────────────────────────────
KEY_FILE="/tmp/firebase-deploy-key.json"
echo "▸ Step 3: Generating service account key..."
gcloud iam service-accounts keys create "$KEY_FILE" \
  --iam-account="$SA_EMAIL" \
  --project="$PROJECT_ID"
echo "  Saved to: $KEY_FILE"
echo ""

# ── Step 4: Print the key contents ─────────────────────────────
echo "═══════════════════════════════════════════════════════════════"
echo "  ACTION REQUIRED: Add these 2 secrets in GitHub"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions"
echo ""
echo "Secret 1: FIREBASE_PROJECT_ID"
echo "  Value:  $PROJECT_ID"
echo ""
echo "Secret 2: FIREBASE_SERVICE_ACCOUNT"
echo "  Value:  (paste the entire contents of $KEY_FILE)"
echo ""
echo "───────────────────────────────────────────────────────────────"
echo "  To copy the key to your clipboard (if on a desktop):"
echo "    cat $KEY_FILE | pbcopy          # macOS"
echo "    cat $KEY_FILE | xclip -selection clipboard  # Linux"
echo ""
echo "  Or just cat it and copy:"
echo "    cat $KEY_FILE"
echo "───────────────────────────────────────────────────────────────"
echo ""

# ── Step 5: Store Groq secret (if not already set) ─────────────
echo "▸ Step 5: Checking GROQ_API_KEY secret..."
echo ""
echo "  If you haven't stored the Groq key yet, run:"
echo "    firebase functions:secrets:set GROQ_API_KEY"
echo "  Then paste: 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"
echo ""
echo "  (This is a one-time setup — the key is stored in Google Cloud Secret Manager.)"
echo ""

# ── Step 6: Verify ─────────────────────────────────────────────
echo "═══════════════════════════════════════════════════════════════"
echo "  Setup complete!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  Next steps:"
echo "  1. Add the 2 secrets above to your GitHub repo"
echo "  2. Push to main (or trigger the workflow manually)"
echo "  3. GitHub Actions will build and deploy your functions"
echo ""
echo "  The workflow runs automatically when you push changes to:"
echo "    - functions/**"
echo "    - firestore.rules"
echo ""
echo "  Or trigger it manually from the Actions tab in GitHub."
echo ""
