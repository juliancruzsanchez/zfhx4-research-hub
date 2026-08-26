import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { useEffect, useState } from "react";

import { firebaseAuth } from "@/lib/firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      setIsLoading(false);
    });
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: Boolean(user),
    signIn: (email: string, password: string) =>
      signInWithEmailAndPassword(firebaseAuth, email, password),
    signUp: (email: string, password: string) =>
      createUserWithEmailAndPassword(firebaseAuth, email, password),
    signOut: () => firebaseSignOut(firebaseAuth),
  };
}
