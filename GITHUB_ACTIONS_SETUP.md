# GitHub Actions Firebase Deployment

This repository includes a GitHub Actions workflow at `.github/workflows/deploy-functions.yml`.

It deploys:

- Firebase Functions
- Firestore security rules
- Firestore indexes

The workflow runs when relevant files are pushed to `main`, or manually from the GitHub Actions tab.

## Recommended authentication

The workflow uses Google **Workload Identity Federation**. This is preferred over storing a long-lived Google service-account JSON key in GitHub.

## One-time GCloud setup

Run these commands on the GCloud server. You need the Google Cloud CLI and permission to manage IAM in the Firebase project.

```bash
gcloud auth login
gcloud config set project zfhx4ai
git pull origin main
chmod +x setup-github-actions.sh
./setup-github-actions.sh YOUR_GITHUB_USERNAME YOUR_REPOSITORY_NAME
```

Example:

```bash
./setup-github-actions.sh jane-doe zfhx4-research-hub
```

The script creates:

- A Workload Identity Pool named `github-actions`
- A GitHub OIDC provider named `github`
- A restricted deployment service account
- Required deployment permissions

At the end, it prints the exact values needed for GitHub.

## GitHub repository secrets

Open this URL, replacing the placeholders:

```text
https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/settings/secrets/actions
```

Create these **repository secrets**:

### `GCP_WORKLOAD_IDENTITY_PROVIDER`

Use the full value printed by the setup script. It looks similar to:

```text
projects/537853698125/locations/global/workloadIdentityPools/github-actions/providers/github
```

### `GCP_DEPLOY_SERVICE_ACCOUNT`

Use the service account printed by the setup script. It looks similar to:

```text
github-firebase-deploy@zfhx4ai.iam.gserviceaccount.com
```

No JSON key is required with this setup.

## Groq API key

Do **not** put the Groq key in GitHub Actions secrets. Firebase Functions reads it from Firebase Secret Manager.

Set it once from the GCloud server:

```bash
firebase functions:secrets:set GROQ_API_KEY --project zfhx4ai
```

When prompted, paste the Groq API key.

Secret Manager link:

```text
https://console.cloud.google.com/security/secret-manager?project=zfhx4ai
```

After setting or changing the secret, deploy the Functions again so the deployed Functions use the current secret version.

## Run a deployment

### Automatic deployment

Push relevant changes to `main`:

```bash
git add .
git commit -m "Update Firebase backend"
git push origin main
```

### Manual deployment

Open:

```text
https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/actions
```

Select **Deploy Firebase backend**, then choose **Run workflow**.

## Files involved

- `.github/workflows/deploy-functions.yml` — deployment workflow
- `setup-github-actions.sh` — GCloud IAM/OIDC setup script
- `firebase.json` — Firebase Functions and Firestore configuration
- `firestore.rules` — Firestore security rules
- `firestore.indexes.json` — Firestore indexes

## If Workload Identity is unavailable

A JSON-key fallback is possible, but it is less secure. Use the existing service-account setup only if your organization does not allow Workload Identity Federation. Never commit the JSON file to the repository.

## After deployment

To regenerate the three reading-level versions of the public research content:

1. Sign in with the configured admin account.
2. Open **Workspace → Research papers**.
3. Click **Re-synthesize**.

This regenerates the layperson, doctor/clinical, and scientist versions in Firestore. Chat responses remain dynamic and are not cached.
