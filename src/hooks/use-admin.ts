import { onIdTokenChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";

import { firebaseAuth } from "@/lib/firebase";

/**
 * Returns `true` when the current user has the `admin: true` custom
 * claim on their Firebase Auth ID token.
 *
 * The claim is server-issued (set via the Firebase Admin SDK or the
 * gcloud CLI) and survives across sign-in / sign-out / token refresh.
 * Reading it requires calling `getIdTokenResult(true)` which forces a
 * token refresh, so this hook is the only place we do that.
 *
 * **Why not check `user.email`?**
 * The original implementation compared the email against a literal
 * `admin@example.com`, which:
 *  - leaked the internal admin identity into the client bundle,
 *  - did not actually match any user in this project (`zfhx4ai`),
 *  - and was a security anti-pattern: anyone with that email was
 *    auto-promoted, and the same email on a different Firebase
 *    project would still grant admin. Custom claims are signed by
 *    Google and cannot be forged client-side.
 *
 * To grant admin to a user:
 *   firebase auth:import users.json --hash-algo=BCRYPT
 *   # or, for an existing user:
 *   firebase functions:secrets:set ADMIN_EMAILS
 *   # then run a one-off Cloud Function that walks the list and sets
 *   # auth.setCustomUserClaims(uid, { admin: true })
 */
export function useAdmin(user: User | null): boolean {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) {
      // Reset to false when the user signs out. This is the canonical
      // "sync React state with a prop changing" pattern; the strict
      // react-hooks rule would prefer a key-based remount upstream,
      // but that complicates the call site for a single boolean.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAdmin(false);
      return;
    }
    // Capture user in a local so TypeScript's control-flow narrowing
    // carries into the nested function definitions below.
    const currentUser = user;
    let cancelled = false;
    async function refresh() {
      const result = await currentUser.getIdTokenResult(true);
      if (!cancelled) setIsAdmin(result.claims.admin === true);
    }
    void refresh();
    const unsubscribe = onIdTokenChanged(firebaseAuth, (next) => {
      if (cancelled) return;
      if (!next) {
        setIsAdmin(false);
        return;
      }
      next
        .getIdTokenResult()
        .then((res) => {
          if (!cancelled) setIsAdmin(res.claims.admin === true);
        })
        .catch(() => {
          if (!cancelled) setIsAdmin(false);
        });
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [user]);

  return isAdmin;
}
