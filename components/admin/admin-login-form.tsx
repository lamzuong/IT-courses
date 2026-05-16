"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { sha256Hex } from "@/lib/client-hash";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const passwordHash = await sha256Hex(password);
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          passwordHash,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setErr(
          body.error === "invalid_credentials"
            ? "Sai username hoặc password."
            : "Đăng nhập thất bại.",
        );
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="admin-form"
      aria-label="Admin login"
      autoComplete="off"
    >
      <label className="admin-field">
        <span>Username</span>
        <input
          type="text"
          name="admin-username-no-autofill"
          autoComplete="off"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={busy}
        />
      </label>
      <label className="admin-field">
        <span>Password</span>
        <input
          type="password"
          name="admin-password-no-autofill"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={busy}
        />
      </label>
      {err && (
        <p className="admin-error" role="alert">
          {err}
        </p>
      )}
      <button
        type="submit"
        className="admin-btn admin-btn--primary"
        disabled={busy}
      >
        {busy ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>
    </form>
  );
}

