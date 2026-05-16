'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { sha256Hex } from '@/lib/client-hash';

type LessonRow = {
  slug: string;
  title: string;
  locked: boolean;
  lockedAt: string | null;
};

type CourseGroup = {
  slug: string;
  title: string;
  lessons: LessonRow[];
};

export function AdminDashboard({ courses }: { courses: CourseGroup[] }) {
  const router = useRouter();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.refresh();
  }

  function k(courseSlug: string, lessonSlug: string) {
    return `${courseSlug}/${lessonSlug}`;
  }

  async function lock(courseSlug: string, lessonSlug: string) {
    const key = k(courseSlug, lessonSlug);
    const password = (drafts[key] ?? '').trim();
    if (password.length < 4) {
      setErrors((m) => ({ ...m, [key]: 'Password ≥ 4 ký tự.' }));
      return;
    }
    setBusyKey(key);
    setErrors((m) => ({ ...m, [key]: '' }));
    const passwordHash = await sha256Hex(password);
    const res = await fetch(
      `/api/admin/courses/${courseSlug}/lessons/${lessonSlug}/lock`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passwordHash }),
      },
    );
    setBusyKey(null);
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setErrors((m) => ({ ...m, [key]: body.error ?? 'Khoá thất bại.' }));
      return;
    }
    setDrafts((m) => ({ ...m, [key]: '' }));
    router.refresh();
  }

  async function unlock(courseSlug: string, lessonSlug: string, title: string) {
    if (!confirm(`Mở khoá bài "${title}"?`)) return;
    const key = k(courseSlug, lessonSlug);
    setBusyKey(key);
    const res = await fetch(
      `/api/admin/courses/${courseSlug}/lessons/${lessonSlug}/lock`,
      { method: 'DELETE' },
    );
    setBusyKey(null);
    if (!res.ok) {
      setErrors((m) => ({ ...m, [key]: 'Mở khoá thất bại.' }));
      return;
    }
    router.refresh();
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-header">
        <div>
          <h1 className="admin-title">Lesson admin</h1>
          <p className="admin-deck">
            Khoá/mở khoá từng bài học. Người dùng phải nhập password để xem bài đã khoá.
          </p>
        </div>
        <button type="button" className="admin-btn" onClick={logout}>
          Đăng xuất
        </button>
      </header>

      <div className="admin-course-groups">
        {courses.map((course) => {
          const lockedCount = course.lessons.filter((l) => l.locked).length;
          return (
            <details key={course.slug} className="admin-course-group" open={lockedCount > 0}>
              <summary className="admin-course-group-summary">
                <span className="admin-course-group-title">{course.title}</span>
                <span className="admin-course-group-stats">
                  {course.lessons.length} bài
                  {lockedCount > 0 && (
                    <span className="admin-course-group-locked">
                      {' · '}
                      🔒 {lockedCount} khoá
                    </span>
                  )}
                </span>
              </summary>
              <ul className="admin-lesson-list">
                {course.lessons.map((lesson) => {
                  const key = k(course.slug, lesson.slug);
                  const busy = busyKey === key;
                  return (
                    <li
                      key={lesson.slug}
                      className={`admin-lesson-row${lesson.locked ? ' is-locked' : ''}`}
                    >
                      <div className="admin-lesson-info">
                        <span
                          className={`admin-status${lesson.locked ? ' admin-status--locked' : ''}`}
                          aria-label={lesson.locked ? 'Khoá' : 'Mở'}
                        >
                          {lesson.locked ? '🔒' : '🔓'}
                        </span>
                        <div className="admin-lesson-text">
                          <span className="admin-lesson-title">{lesson.title}</span>
                          <span className="admin-lesson-slug">
                            /{course.slug}/{lesson.slug}
                            {lesson.lockedAt && (
                              <span className="admin-lesson-meta">
                                {' · khoá lúc '}
                                {new Date(lesson.lockedAt).toLocaleString()}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="admin-lesson-actions">
                        {lesson.locked ? (
                          <button
                            type="button"
                            className="admin-btn"
                            onClick={() => unlock(course.slug, lesson.slug, lesson.title)}
                            disabled={busy}
                          >
                            {busy ? 'Đang mở…' : 'Mở khoá'}
                          </button>
                        ) : (
                          <div className="admin-lock-row">
                            <input
                              type="text"
                              placeholder="Password"
                              value={drafts[key] ?? ''}
                              onChange={(e) =>
                                setDrafts((m) => ({ ...m, [key]: e.target.value }))
                              }
                              disabled={busy}
                            />
                            <button
                              type="button"
                              className="admin-btn admin-btn--primary"
                              onClick={() => lock(course.slug, lesson.slug)}
                              disabled={busy}
                            >
                              {busy ? '…' : 'Khoá'}
                            </button>
                          </div>
                        )}
                        {errors[key] && <p className="admin-error">{errors[key]}</p>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>
    </div>
  );
}
