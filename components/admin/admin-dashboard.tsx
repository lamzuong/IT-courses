'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sha256Hex } from '@/lib/client-hash';

type LockRow = {
  scopeKey: string;
  label: string;
  locked: boolean;
  lockedAt: string | null;
};

type ParentGroup = {
  /** Scope key for the parent (e.g. "course/foo", "english/bar", "chinese/cantonese") */
  parentScopeKey: string;
  /** Display title of the parent */
  title: string;
  /** Lock state of the parent itself */
  parentLock: { locked: boolean; lockedAt: string | null };
  /** Lesson rows underneath, with their own lesson-level scope keys */
  lessons: LockRow[];
  /** Display label for the "lock whole parent" row, e.g. "Khoá cả khoá học" */
  parentLockLabel: string;
};

type Section = {
  title: string;
  parentLockLabel: string;
  groups: ParentGroup[];
};

export function AdminDashboard({
  sections,
}: {
  sections: Section[];
}) {
  const router = useRouter();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.refresh();
  }

  async function lock(scopeKey: string) {
    const password = (drafts[scopeKey] ?? '').trim();
    if (password.length < 4) {
      setErrors((m) => ({ ...m, [scopeKey]: 'Password ≥ 4 ký tự.' }));
      return;
    }
    setBusyKey(scopeKey);
    setErrors((m) => ({ ...m, [scopeKey]: '' }));
    const passwordHash = await sha256Hex(password);
    const res = await fetch('/api/admin/locks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: scopeKey, passwordHash }),
    });
    setBusyKey(null);
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setErrors((m) => ({ ...m, [scopeKey]: body.error ?? 'Khoá thất bại.' }));
      return;
    }
    setDrafts((m) => ({ ...m, [scopeKey]: '' }));
    router.refresh();
  }

  async function unlock(scopeKey: string, label: string) {
    if (!confirm(`Mở khoá "${label}"?`)) return;
    setBusyKey(scopeKey);
    const res = await fetch('/api/admin/locks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: scopeKey }),
    });
    setBusyKey(null);
    if (!res.ok) {
      setErrors((m) => ({ ...m, [scopeKey]: 'Mở khoá thất bại.' }));
      return;
    }
    router.refresh();
  }

  function renderActions(row: LockRow) {
    const busy = busyKey === row.scopeKey;
    return (
      <>
        {row.locked ? (
          <button
            type="button"
            className="admin-btn"
            onClick={() => unlock(row.scopeKey, row.label)}
            disabled={busy}
          >
            {busy ? 'Đang mở…' : 'Mở khoá'}
          </button>
        ) : (
          <div className="admin-lock-row">
            <input
              type="text"
              placeholder="Password"
              value={drafts[row.scopeKey] ?? ''}
              onChange={(e) => setDrafts((m) => ({ ...m, [row.scopeKey]: e.target.value }))}
              disabled={busy}
            />
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={() => lock(row.scopeKey)}
              disabled={busy}
            >
              {busy ? '…' : 'Khoá'}
            </button>
          </div>
        )}
        {errors[row.scopeKey] && <p className="admin-error">{errors[row.scopeKey]}</p>}
      </>
    );
  }

  function renderGroup(group: ParentGroup, parentLockLabel: string) {
    const lockedLessons = group.lessons.filter((l) => l.locked).length;
    return (
      <details
        key={group.parentScopeKey}
        className={`admin-course-group${group.parentLock.locked ? ' is-locked' : ''}`}
        open={group.parentLock.locked || lockedLessons > 0}
      >
        <summary className="admin-course-group-summary">
          <span className="admin-course-group-title">
            {group.parentLock.locked && <span style={{ marginRight: '0.4rem' }}>🔒</span>}
            {group.title}
          </span>
          <span className="admin-course-group-stats">
            {group.lessons.length} bài
            {lockedLessons > 0 && (
              <span className="admin-course-group-locked">
                {' · '}🔒 {lockedLessons} bài khoá
              </span>
            )}
            {group.parentLock.locked && (
              <span className="admin-course-group-locked">{' · '}cả phần đang khoá</span>
            )}
          </span>
        </summary>

        <div className="admin-course-overlock">
          <strong>{parentLockLabel}:</strong>
          <div className="admin-lesson-actions">
            {renderActions({
              scopeKey: group.parentScopeKey,
              label: group.title,
              locked: group.parentLock.locked,
              lockedAt: group.parentLock.lockedAt,
            })}
          </div>
        </div>

        <ul className="admin-lesson-list">
          {group.lessons.map((lesson) => (
            <li
              key={lesson.scopeKey}
              className={`admin-lesson-row${lesson.locked ? ' is-locked' : ''}`}
            >
              <div className="admin-lesson-info">
                <span
                  className={`admin-status${lesson.locked ? ' admin-status--locked' : ''}`}
                >
                  {lesson.locked ? '🔒' : '🔓'}
                </span>
                <div className="admin-lesson-text">
                  <span className="admin-lesson-title">{lesson.label}</span>
                  <span className="admin-lesson-slug">
                    {lesson.scopeKey}
                    {lesson.lockedAt && (
                      <span className="admin-lesson-meta">
                        {' · khoá lúc '}
                        {new Date(lesson.lockedAt).toLocaleString()}
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <div className="admin-lesson-actions">{renderActions(lesson)}</div>
            </li>
          ))}
        </ul>
      </details>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div>
          <h1 className="admin-title">Content admin</h1>
          <p className="admin-deck">
            Khoá ở bất kỳ cấp: cả khoá học/chủ đề/ngôn ngữ, hoặc từng bài học riêng lẻ.
          </p>
        </div>
        <button type="button" className="admin-btn" onClick={logout}>
          Đăng xuất
        </button>
      </header>

      {sections.map((section) => (
        <section key={section.title} style={{ marginBottom: '1.5rem' }}>
          <h2 className="hash-gen-section-title" style={{ marginBottom: '0.85rem' }}>
            {section.title}
          </h2>
          <div className="admin-course-groups">
            {section.groups.map((g) => renderGroup(g, section.parentLockLabel))}
          </div>
        </section>
      ))}
    </div>
  );
}
