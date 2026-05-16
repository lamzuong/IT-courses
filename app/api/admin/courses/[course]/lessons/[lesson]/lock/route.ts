import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { lockLesson, unlockLesson } from '@/lib/lesson-locks';
import { getLesson } from '@/lib/courses';

export const runtime = 'nodejs';

const SHA256_HEX = /^[a-f0-9]{64}$/;

function isValid(courseSlug: string, lessonSlug: string): boolean {
  return Boolean(getLesson(courseSlug, lessonSlug));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ course: string; lesson: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const { course, lesson } = await params;
  if (!isValid(course, lesson)) {
    return NextResponse.json({ ok: false, error: 'unknown_lesson' }, { status: 404 });
  }
  let body: { passwordHash?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }
  const { passwordHash } = body;
  if (typeof passwordHash !== 'string' || !SHA256_HEX.test(passwordHash)) {
    return NextResponse.json({ ok: false, error: 'invalid_hash_shape' }, { status: 400 });
  }
  await lockLesson(course, lesson, passwordHash);
  revalidatePath(`/courses/${course}/lessons/${lesson}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ course: string; lesson: string }> },
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const { course, lesson } = await params;
  if (!isValid(course, lesson)) {
    return NextResponse.json({ ok: false, error: 'unknown_lesson' }, { status: 404 });
  }
  await unlockLesson(course, lesson);
  revalidatePath(`/courses/${course}/lessons/${lesson}`);
  return NextResponse.json({ ok: true });
}
