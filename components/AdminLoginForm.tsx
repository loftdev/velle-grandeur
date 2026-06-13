"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "../lib/supabase/client";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.replace("/admin");
  };

  return (
    <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
      {process.env.NODE_ENV === "development" ? (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--accent-soft)] p-3 text-sm">
          <p className="font-medium">Test admin account</p>
          <p className="mt-1">Email: test.admin@example.com</p>
          <p>Password: password</p>
        </div>
      ) : null}
      <label className="grid gap-2 text-sm font-medium">
        Email
        <input
          id="admin-email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          required
          className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Password
        <input
          id="admin-password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          autoComplete="current-password"
          required
          className="rounded-xl border border-[var(--line)] bg-white px-3 py-2"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        className="button bg-[var(--accent)] text-white"
        type="submit"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
