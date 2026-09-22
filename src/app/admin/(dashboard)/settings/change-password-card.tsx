"use client";

import { useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ChangePasswordCard() {
  const [email, setEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  async function handleSendResetEmail() {
    if (!email) return;
    setStatus("sending");
    const supabase = createBrowserSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    setStatus(error ? "error" : "sent");
  }

  return (
    <Card className="mt-4">
      <h2 className="mb-1 text-sm font-semibold text-zinc-700">Your Password</h2>
      <p className="mb-4 text-xs text-zinc-500">
        For security, changing your password happens through a confirmation
        link sent to your email ({email ?? "..."}) -- not directly here.
      </p>
      <Button
        type="button"
        variant="secondary"
        disabled={!email || status === "sending"}
        onClick={handleSendResetEmail}
      >
        {status === "sending" ? "Sending..." : "Send password reset email"}
      </Button>
      {status === "sent" && (
        <p className="mt-2 text-sm text-emerald-700">
          Check your email for a link to set a new password.
        </p>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-red-600">
          Couldn&apos;t send the email. Try again in a moment.
        </p>
      )}
    </Card>
  );
}
