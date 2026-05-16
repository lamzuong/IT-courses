"use client";
import { useState } from "react";
import { sha256Hex } from "@/lib/client-hash";

export function HashGenerator() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [shaHex, setShaHex] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setShaHex(null);
    try {
      // Same flow as the login form: client computes SHA-256 first,
      // then bcrypt hashes the hex digest (cost factor 10).
      // The login form sends exactly this SHA-256 hex over the network.
      const sha = await sha256Hex(password);
      setShaHex(sha);
    } finally {
      setBusy(false);
    }
  }

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      const el = document.querySelector(
        `[data-copy="${label}"]`,
      ) as HTMLElement | null;
      el?.focus();
    }
  }

  const envBlock = shaHex
    ? [
        `ADMIN_USERNAME=${username || "admin"}`,
        `ADMIN_PASSWORD_HASH=${shaHex}`,
      ].join("\n")
    : null;

  return (
    <div className="hash-gen">
      <section className="hash-gen-card">
        <h2 className="hash-gen-section-title">1 · Generate password hash</h2>
        <p className="admin-deck" style={{ marginBottom: "1rem" }}>
          Plaintext never leaves browser — SHA-256 then bcrypt cost 10, both
          client-side.
        </p>
        <form onSubmit={generate} className="admin-form">
          <label className="admin-field">
            <span>Username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
            />
          </label>
          <label className="admin-field">
            <span>Plaintext password</span>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="your-real-password"
              autoComplete="off"
            />
          </label>
          <button
            type="submit"
            className="admin-btn admin-btn--primary"
            disabled={!password || busy}
          >
            {busy ? "Hashing…" : "Generate hash"}
          </button>
        </form>

        {shaHex && (
          <div className="hash-gen-output">
            {shaHex && (
              <div
                className="hash-gen-field"
                style={{ marginBottom: "0.85rem" }}
              >
                <label>
                  SHA-256 (what the login form sends over the network)
                </label>
                <div className="hash-gen-row">
                  <code data-copy="sha">{shaHex}</code>
                  <button
                    type="button"
                    className="admin-btn"
                    onClick={() => copy(shaHex, "sha")}
                  >
                    {copied === "sha" ? "✓ Copied" : "Copy"}
                  </button>
                </div>
              </div>
            )}
            <div className="hash-gen-field">
              <label>ADMIN_PASSWORD_HASH (goes into .env.local)</label>
              <div className="hash-gen-row">
                <code data-copy="hash">{shaHex}</code>
                <button
                  type="button"
                  className="admin-btn"
                  onClick={() => copy(shaHex, "hash")}
                >
                  {copied === "hash" ? "✓ Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {envBlock && (
        <section className="hash-gen-card hash-gen-final">
          <h2 className="hash-gen-section-title">2 · Paste into .env.local</h2>
          <p className="admin-deck" style={{ marginBottom: "1rem" }}>
            Create or open <code>.env.local</code> in the project root, paste
            below, then <strong>restart the dev server</strong> (Ctrl+C →{" "}
            <code>npm run dev</code>).
          </p>
          <div className="hash-gen-row">
            <pre data-copy="env" className="hash-gen-env-block">
              {envBlock}
            </pre>
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={() => copy(envBlock, "env")}
            >
              {copied === "env" ? "✓ Copied" : "Copy all"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

