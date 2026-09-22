"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { AppIcon } from "@/components/ui/app-icon";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    // The recovery link's tokens are processed by the SDK on load; once a
    // session exists (or the SDK fires PASSWORD_RECOVERY), the form unlocks.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setPending(true);
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (error) {
      setError("Couldn't update the password. The link may have expired.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/admin"), 1500);
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <AppIcon size={48} className="mb-3" />
        <h1 className="text-xl font-semibold text-zinc-900">Set a New Password</h1>

        {!ready && !done && (
          <p className="mt-3 text-sm text-zinc-500">
            Opening this from the link in your email confirms it&apos;s you --
            waiting for that to finish...
          </p>
        )}

        {ready && !done && (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Field label="New password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            <Field label="Confirm new password">
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </Field>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? "Saving..." : "Update password"}
            </Button>
          </form>
        )}

        {done && (
          <p className="mt-6 text-sm text-emerald-700">
            Password updated. Taking you to the dashboard...
          </p>
        )}
      </div>
    </main>
  );
}
