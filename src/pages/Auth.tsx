import { FirebaseError } from "firebase/app";
import { ArrowRight, Dna, Loader2, LockKeyhole, Mail } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

function authMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    if (error.code === "auth/invalid-credential") return "That email or password is not correct.";
    if (error.code === "auth/email-already-in-use") return "An account already exists for this email.";
    if (error.code === "auth/weak-password") return "Choose a password with at least six characters.";
  }
  return "We could not complete that request. Please try again.";
}

function Auth() {
  const { isLoading: authLoading, isAuthenticated, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const redirect = returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/workspace";
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate(redirect, { replace: true });
  }, [authLoading, isAuthenticated, navigate, redirect]);

  if (!authLoading && isAuthenticated) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    try {
      if (mode === "signIn") await signIn(email, password);
      else await signUp(email, password);
      navigate(redirect, { replace: true });
    } catch (requestError) {
      setError(authMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8f7] px-5 py-10 text-[#18322f]">
      <Card className="w-full max-w-md border-[#dbe6e2] bg-white shadow-none">
        <CardHeader className="space-y-4 text-center">
          <button type="button" onClick={() => navigate("/")} className="mx-auto flex size-11 cursor-pointer items-center justify-center rounded-xl bg-[#18322f] text-[#d9f0e9]" aria-label="Back to ZFHX4 Research Hub">
            <Dna className="size-5" />
          </button>
          <div>
            <CardTitle className="text-2xl tracking-[-0.04em]">{mode === "signIn" ? "Access your research hub" : "Create your research account"}</CardTitle>
            <CardDescription className="mt-2 leading-6">Save medical record uploads, findings, document questions, and symptom experiences in one private workspace.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-0 text-center">
          <button type="button" onClick={() => navigate("/")} className="text-xs font-medium text-[#526965] underline-offset-2 hover:underline">
            ← Back to home
          </button>
        </CardContent>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 size-4 text-[#8ba09a]" />
              <Input name="email" type="email" placeholder="you@example.com" className="h-11 border-[#d5e2de] pl-9" required disabled={isSubmitting} />
            </div>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-3 size-4 text-[#8ba09a]" />
              <Input name="password" type="password" placeholder="Password" minLength={6} className="h-11 border-[#d5e2de] pl-9" required disabled={isSubmitting} />
            </div>
            {error && <p className="text-sm leading-5 text-red-600">{error}</p>}
          </CardContent>
          <CardFooter className="flex-col gap-4 pt-2">
            <Button type="submit" className="h-11 w-full cursor-pointer gap-2 bg-[#398b74] text-white hover:bg-[#2d755f]" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              {mode === "signIn" ? "Sign in" : "Create account"}
            </Button>
            <Button type="button" variant="ghost" className="cursor-pointer text-[#4f7168]" onClick={() => { setMode(mode === "signIn" ? "signUp" : "signIn"); setError(null); }}>
              {mode === "signIn" ? "Need an account? Create one" : "Already have an account? Sign in"}
            </Button>
          </CardFooter>
        </form>
        <p className="border-t border-[#edf1ef] px-6 py-4 text-center text-xs leading-5 text-[#81938e]">Your workspace is for organizing information, not for diagnosing or treating a medical condition.</p>
      </Card>
    </main>
  );
}

export default function AuthPage() {
  return <Suspense><Auth /></Suspense>;
}
