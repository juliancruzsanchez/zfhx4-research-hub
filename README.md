# ZFHX4 Research Hub

A patient-facing research workspace for organizing ZFHX4 papers, private medical-record PDFs, AI-extracted findings, document questions, and lived experiences.

## Stack

- Vite + React + TypeScript
- Firebase Authentication
- Cloud Firestore for documents, findings, chat messages, and experience reports
- Firebase Storage for customer-uploaded PDF medical record exports
- Firebase Functions for all Groq AI requests and automatic PDF extraction
- Groq for document analysis and document-scoped chat
- Cloudflare Workers for static hosting

## Local configuration

The client needs these Vite variables in the environment managed by the project:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Set `GROQ_API_KEY` as a Firebase Functions secret. The browser never receives the Groq key.

## Firebase setup

1. Create a Firebase project and enable Email/Password Authentication, Firestore, and Storage.
2. Add a web app and copy its client config into the Vite environment variables above.
3. Deploy Firestore rules and indexes, Storage rules, and Functions from the repository root.
4. Set the secret with `firebase functions:secrets:set GROQ_API_KEY`.
5. Build the app with `bun run build`.

Uploaded PDFs must be under 25 MB and are automatically processed by the `extractUploadedPdf` Storage trigger. The callable `chatWithDocument` function sends document questions to Groq and writes both sides of the conversation to Firestore.

## Cloudflare hosting

`wrangler.toml` configures the Cloudflare Worker to serve the Vite `dist` directory. After building, deploy with:

```bash
bun run build:worker
```

The Firebase project remains the backend for authentication, data, storage, and AI functions; Cloudflare only hosts the web app and its health endpoint.

## Safety boundaries

The AI features summarize and locate information in uploaded documents. They do not diagnose, recommend treatment, or replace a clinician. Legal and medical-information pages are intentionally stubbed for completion before public launch.
