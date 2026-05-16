'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sha256Hex } from '@/lib/client-hash';

export function LessonLockGate({
  scopeKey,
  title,
  subtitle,
}: {
  scopeKey: string;
  title: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setErr(null);
    try {
      const passwordHash = await sha256Hex(password);
      const res = await fetch('/api/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: scopeKey, passwordHash }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setErr(body.error === 'wrong_password' ? 'Sai password.' : 'Mở khoá thất bại.');
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main-content" className="lock-gate-shell">
      <div className="lock-gate-icon" aria-hidden>🔒</div>
      <h1 className="lock-gate-title">Nội dung đang khoá</h1>
      <p className="lock-gate-deck">
        <strong>{title}</strong>
        {subtitle && (
          <>
            <br />
            <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>{subtitle}</span>
          </>
        )}
      </p>
      <form className="lock-gate-form" onSubmit={submit}>
        <input
          type="password"
          placeholder="Nhập password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={busy}
          autoFocus
        />
        {err && <p className="admin-error" role="alert">{err}</p>}
        <button type="submit" className="admin-btn admin-btn--primary" disabled={busy || !password}>
          {busy ? 'Đang kiểm tra…' : 'Mở khoá'}
        </button>
      </form>
    </main>
  );
}
