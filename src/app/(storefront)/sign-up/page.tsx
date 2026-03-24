"use client";

import { signIn } from "next-auth/react";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Registration failed. Please try again.");
      setLoading(false);
      return;
    }

    // Auto sign-in after registration
    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInRes?.error) {
      // Account created but sign-in failed — redirect to sign-in
      router.push("/sign-in");
      return;
    }

    // Merge guest cart into user cart
    const guestSessionId = document.cookie
      .split("; ")
      .find((r) => r.startsWith("cart_session_id="))
      ?.split("=")[1];

    if (guestSessionId) {
      await fetch("/api/cart/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestSessionId }),
      });
    }

    router.push("/account");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Create account</h1>
          <p className="text-sm text-chalk/50">Join MAISON for exclusive access</p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-chalk/60 mb-1.5 uppercase tracking-wider">
              Full name
            </label>
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-void-2 border border-border rounded-lg text-sm text-chalk placeholder:text-chalk-3 focus:outline-none focus:border-acid transition-colors"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-chalk/60 mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-void-2 border border-border rounded-lg text-sm text-chalk placeholder:text-chalk-3 focus:outline-none focus:border-acid transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-chalk/60 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-void-2 border border-border rounded-lg text-sm text-chalk placeholder:text-chalk-3 focus:outline-none focus:border-acid transition-colors"
              placeholder="Min. 8 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-chalk text-void text-sm font-semibold rounded-lg hover:bg-chalk/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-xs text-chalk/30 text-center">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="underline hover:text-chalk/60">Terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-chalk/60">Privacy Policy</Link>.
        </p>

        <p className="mt-5 text-center text-sm text-chalk/40">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-chalk hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
