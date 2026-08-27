#!/usr/bin/env bash
# Configure GitHub Actions to deploy this Firebase project without storing a
# long-lived Google service-account JSON key in GitHub.
#
# Run from the repository root after authenticating gcloud:
#   gcloud auth login
#   gcloud config set project zfhx4ai
#   chmod +x setup-github-actions.sh
#   ./setup-github-actions.sh YOUR_GITHUB_OWNER YOUR_GITHUB_REPO
#
# The script prints the two GitHub Actions secrets to add:
#   GCP_WORKLOAD_IDENTITY_PROVIDER
#   GCP_DEPLOY_SERVICE_ACCOUNT

set -euo pipefail

PROJECT_ID="zfhx4ai"
GITHUB_OWNER="${1:?Pass your GitHub owner/org as the first argument}"
GITHUB_REPO="${2:?Pass your GitHub repository name as the second argument}"
POOL_ID="github-actions"
PROVIDER_ID="github"
SERVICE_ACCOUNT_ID="github-firebase-deploy"
SERVICE_ACCOUNT="${SERVICE_ACCOUNT_ID}@${PROJECT_ID}.iam.gserviceaccount.com"

 gcloud config set project "$PROJECT_ID" >/dev/null

for API in iamcredentials.googleapis.com sts.googleapis.com cloudresourcemanager.googleapis.com artifactregistry.googleapis.com cloudfunctions.googleapis.com firebase.googleapis.com; do
  gcloud services enable "$API" --project="$PROJECT_ID"
done

if ! gcloud iam service-accounts describe "$SERVICE_ACCOUNT" --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam service-accounts create "$SERVICE_ACCOUNT_ID" \
    --project="$PROJECT_ID" \
    --display-name="GitHub Firebase deployer"
fi

for ROLE in roles/firebase.admin roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="$ROLE" \
    --condition=None \
    --quiet >/dev/null
done

if ! gcloud iam workload-identity-pools describe "$POOL_ID" --location=global --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools create "$POOL_ID" \
    --location=global \
    --project="$PROJECT_ID" \
    --display-name="GitHub Actions"
fi

if ! gcloud iam workload-identity-pools providers describe "$PROVIDER_ID" \
  --workload-identity-pool="$POOL_ID" --location=global --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud iam workload-identity-pools providers create-oidc "$PROVIDER_ID" \
    --workload-identity-pool="$POOL_ID" \
    --location=global \
    --project="$PROJECT_ID" \
    --display-name="GitHub repository provider" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
    --attribute-condition="assertion.repository == '${GITHUB_OWNER}/${GITHUB_REPO}'"
fi

PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
PROVIDER_RESOURCE="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"

# Only this exact repository may impersonate the deploy service account.
gcloud iam service-accounts add-iam-policy-binding "$SERVICE_ACCOUNT" \
  --project="$PROJECT_ID" \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${GITHUB_OWNER}/${GITHUB_REPO}" \
  --condition=None \
  --quiet >/dev/null

echo
echo "Setup complete. Add these GitHub Actions repository secrets:"
echo
echo "GCP_WORKLOAD_IDENTITY_PROVIDER"
echo "$PROVIDER_RESOURCE"
echo
echo "GCP_DEPLOY_SERVICE_ACCOUNT"
echo "$SERVICE_ACCOUNT"
echo
echo "GitHub secrets URL:"
echo "https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/settings/secrets/actions"
echo
echo "Then push to main or run the workflow manually."
