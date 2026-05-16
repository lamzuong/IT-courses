import type { Metadata } from 'next';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { getAllLessonLocks } from '@/lib/lesson-locks';
import { getAllCourses, flattenLessons } from '@/lib/courses';
import { AdminLoginForm } from '@/components/admin/admin-login-form';
import { AdminDashboard } from '@/components/admin/admin-dashboard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return (
      <main id="main-content" className="admin-shell">
        <div className="admin-login-card">
          <h1 className="admin-title">Admin</h1>
          <p className="admin-deck">Đăng nhập để quản lý khoá bài học.</p>
          <AdminLoginForm />
        </div>
      </main>
    );
  }

  const locks = await getAllLessonLocks();
  const courses = getAllCourses().map((course) => ({
    slug: course.slug,
    title: course.title,
    lessons: flattenLessons(course).map((lesson) => {
      const key = `${course.slug}/${lesson.slug}`;
      return {
        slug: lesson.slug,
        title: lesson.title,
        locked: Boolean(locks[key]),
        lockedAt: locks[key]?.lockedAt ?? null,
      };
    }),
  }));

  return (
    <main id="main-content" className="admin-shell">
      <AdminDashboard courses={courses} />
    </main>
  );
}
