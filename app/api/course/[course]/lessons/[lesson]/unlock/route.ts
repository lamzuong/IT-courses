import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  grantLessonAccess,
  isLessonLocked,
  verifyLessonPassword,
} from '@/lib/lesson-locks';

export const runtime = 'nodejs';

const SHA256_HEX = /^[a-f0-9]{64}$/;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ course: string; lesson: string }> },
) {
  const { course, lesson } = await params;
  if (!(await isLessonLocked(course, lesson))) {
    return NextResponse.json({ ok: true, alreadyOpen: true });
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
  const valid = await verifyLessonPassword(course, lesson, passwordHash);
  if (!valid) {
    return NextResponse.json({ ok: false, error: 'wrong_password' }, { status: 401 });
  }
  await grantLessonAccess(course, lesson);
  revalidatePath(`/courses/${course}/lessons/${lesson}`);
  return NextResponse.json({ ok: true });
}
