import type { Metadata } from 'next';
import { HashGenerator } from '@/components/admin/hash-generator';

export const metadata: Metadata = {
  title: 'Admin setup',
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminSetupPage() {
  return (
    <main id="main-content" className="admin-shell">
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="admin-title">Admin setup</h1>
        <p className="admin-deck">
          One-time tool to generate the values for <code>.env.local</code>. Runs entirely in your browser — plaintext is never sent over the network. No login required (you need this to <em>set</em> your login).
        </p>
      </header>
      <HashGenerator />
    </main>
  );
}
