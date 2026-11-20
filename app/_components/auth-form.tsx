"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const plan = params.get("plan");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const next = `/dashboard${plan === "starter" || plan === "pro" ? `?plan=${plan}` : ""}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    const sb = supabaseBrowser();
    if (mode === "signup") {
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}${next}` },
      });
      if (error) setError(error.message);
      else if (data.session) router.push(next);
      else setInfo("Check your email to confirm your account, then log in.");
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push(next);
    }
    setBusy(false);
  }

  async function reset() {
    if (!email) return setError("Enter your email first.");
    const { error } = await supabaseBrowser().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/dashboard?reset=1` });
    if (error) setError(error.message);
    else setInfo("We've emailed you a link to reset your password.");
  }

  return (
    <form className="auth" onSubmit={submit}>
      <h1>{mode === "signup" ? "Create your chatbot" : "Log in"}</h1>
      <p className="hint">
        {mode === "signup" ? (
          <>Already have an account? <Link href={`/login${plan ? `?plan=${plan}` : ""}`}>Log in</Link></>
        ) : (
          <>New to LetsChat? <Link href="/signup">Create an account</Link></>
        )}
      </p>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
      />
      {mode === "signup" && <div className="hint">At least 8 characters.</div>}
      <div style={{ marginTop: 18 }}>
        <button className="btn" disabled={busy} style={{ width: "100%" }}>
          {busy ? "Please wait..." : mode === "signup" ? "Create account" : "Log in"}
        </button>
      </div>
      {mode === "login" && (
        <p className="hint">
          <a href="#" onClick={(e) => { e.preventDefault(); reset(); }}>Forgot password?</a>
        </p>
      )}
      {error && <div className="err">{error}</div>}
      {info && <div className="okmsg">{info}</div>}
    </form>
  );
}
