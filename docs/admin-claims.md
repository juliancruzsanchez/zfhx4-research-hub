# Granting admin access

Admin actions in ZFHX4 Research Hub (publishing / archiving papers,
re-synthesising the homepage, viewing pending research) are gated by
the `admin: true` custom claim on the user's Firebase Auth ID token.

The Functions code in `functions/src/index.ts` checks
`request.auth.token.admin` AND falls back to the
`ADMIN_EMAILS` env var. The client (`useAdmin` in
`src/hooks/use-admin.ts`) reads the claim from the ID token and
shows admin-only UI accordingly.

The check is **defence in depth** — even if the client hides the
admin UI, the Functions refuse the call if the claim is absent.
So granting admin is a server-side operation that must be done
via the Firebase Admin SDK. There is no self-service sign-up.

## Grant admin to a user (one-off)

```bash
# From the project root, with the Firebase CLI authenticated to the
# zfhx4ai project:
firebase functions:shell
```

Then in the shell:

```js
const admin = require("firebase-admin");
admin.initializeApp();
admin.auth().setCustomUserClaims("USER_UID_HERE", { admin: true });
```

Or run a one-off Node script locally with a service-account key:

```js
// scripts/grant-admin.cjs
const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.applicationDefault() });
const uid = process.argv[2];
if (!uid) throw new Error("usage: node grant-admin.cjs <uid>");
admin
  .auth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`granted admin to ${uid}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
```

The user must refresh their ID token (sign out / sign in, or wait up
to one hour) before the client picks up the new claim.

## Revoke admin

```js
admin.auth().setCustomUserClaims(uid, { admin: false });
```

## Why not just check the email?

The previous client implementation compared `user.email` against
`admin@example.com`. That is unsafe because:

1. The string is shipped in the client bundle, leaking the internal
   admin identity to anyone who views source.
2. The same email on a different Firebase project would still grant
   admin — a project boundary the server should enforce, not the
   client.
3. Custom claims are signed by Google and cannot be forged by a
   user, while an email check can always be bypassed by changing
   the email on a fresh account.

The new path uses the `admin` custom claim exclusively, with the
`ADMIN_EMAILS` env var as a server-side fallback for migration.
