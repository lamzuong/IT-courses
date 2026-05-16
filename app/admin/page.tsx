import type { Metadata } from 'next';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getAllLocks } from '@/lib/locks';
import { getAllCourses, flattenLessons } from '@/lib/courses';
import { getAllEnglishTopics, flattenEnglishLessons } from '@/lib/english';
import { CHINESE_LANGUAGES } from '@/content/chinese';
import { AdminLoginForm } from '@/components/admin/admin-login-form';
import { AdminDashboard } from '@/components/admin/admin-dashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false, nocache: true },
};

type Locks = Record<string, { lockedAt: string }>;

function rowFor(locks: Locks, scopeKey: string, label: string) {
  return {
    scopeKey,
    label,
    locked: Boolean(locks[scopeKey]),
    lockedAt: locks[scopeKey]?.lockedAt ?? null,
  };
}

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return (
      <main id="main-content" className="admin-shell">
        <div className="admin-login-card">
          <h1 className="admin-title">Admin</h1>
          <p className="admin-deck">Đăng nhập để quản lý nội dung.</p>
          <AdminLoginForm />
        </div>
      </main>
    );
  }

  const locks = await getAllLocks();

  const courseGroups = getAllCourses().map((course) => {
    const parentScopeKey = `course/${course.slug}`;
    return {
      parentScopeKey,
      title: course.title,
      parentLockLabel: 'Khoá cả khoá học',
      parentLock: {
        locked: Boolean(locks[parentScopeKey]),
        lockedAt: locks[parentScopeKey]?.lockedAt ?? null,
      },
      lessons: flattenLessons(course).map((lesson) =>
        rowFor(locks, `lesson/${course.slug}/${lesson.slug}`, lesson.title),
      ),
    };
  });

  const englishGroups = getAllEnglishTopics()
    .filter((t) => !t.placeholder)
    .map((topic) => {
      const parentScopeKey = `english/${topic.slug}`;
      return {
        parentScopeKey,
        title: topic.title,
        parentLockLabel: 'Khoá cả chủ đề',
        parentLock: {
          locked: Boolean(locks[parentScopeKey]),
          lockedAt: locks[parentScopeKey]?.lockedAt ?? null,
        },
        lessons: flattenEnglishLessons(topic).map((lesson) =>
          rowFor(locks, `english-lesson/${topic.slug}/${lesson.slug}`, lesson.title),
        ),
      };
    });

  const chineseGroups = CHINESE_LANGUAGES.map((lang) => {
    const parentScopeKey = `chinese/${lang.slug}`;
    const lessons: { slug: string; title: string }[] = [];
    for (const topic of lang.topics) {
      for (const lesson of topic.lessons) {
        lessons.push({ slug: lesson.slug, title: lesson.title });
      }
    }
    return {
      parentScopeKey,
      title: `${lang.title} (${lang.vietnameseName})`,
      parentLockLabel: 'Khoá cả ngôn ngữ',
      parentLock: {
        locked: Boolean(locks[parentScopeKey]),
        lockedAt: locks[parentScopeKey]?.lockedAt ?? null,
      },
      lessons: lessons.map((lesson) =>
        rowFor(locks, `chinese-lesson/${lang.slug}/${lesson.slug}`, lesson.title),
      ),
    };
  });

  return (
    <main id="main-content" className="admin-shell" style={{ maxWidth: 1100 }}>
      <AdminDashboard
        sections={[
          { title: 'Khoá học chính', parentLockLabel: 'Khoá cả khoá học', groups: courseGroups },
          { title: 'Tiếng Anh giao tiếp', parentLockLabel: 'Khoá cả chủ đề', groups: englishGroups },
          { title: 'Tiếng Trung', parentLockLabel: 'Khoá cả ngôn ngữ', groups: chineseGroups },
        ]}
      />
    </main>
  );
}
