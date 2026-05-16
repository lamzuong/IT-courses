import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { lockScope, unlockScope, keyToScope, type Scope } from '@/lib/locks';
import { getLesson, getCourse } from '@/lib/courses';
import { getEnglishTopic, getEnglishLesson } from '@/lib/english';
import { getChineseLanguage, findChineseLesson } from '@/content/chinese';

export const runtime = 'nodejs';

const SHA256_HEX = /^[a-f0-9]{64}$/;

function scopeIsValid(scope: Scope): boolean {
  switch (scope.kind) {
    case 'course':
      return Boolean(getCourse(scope.id));
    case 'lesson': {
      const sep = scope.id.indexOf('/');
      if (sep === -1) return false;
      return Boolean(getLesson(scope.id.slice(0, sep), scope.id.slice(sep + 1)));
    }
    case 'english':
      return Boolean(getEnglishTopic(scope.id));
    case 'english-lesson': {
      const sep = scope.id.indexOf('/');
      if (sep === -1) return false;
      return Boolean(getEnglishLesson(scope.id.slice(0, sep), scope.id.slice(sep + 1)));
    }
    case 'chinese':
      return Boolean(getChineseLanguage(scope.id));
    case 'chinese-lesson': {
      const sep = scope.id.indexOf('/');
      if (sep === -1) return false;
      return Boolean(findChineseLesson(scope.id.slice(0, sep), scope.id.slice(sep + 1)));
    }
  }
}

function revalidationPaths(scope: Scope): string[] {
  switch (scope.kind) {
    case 'course':
      return [`/courses/${scope.id}`];
    case 'lesson': {
      const sep = scope.id.indexOf('/');
      return [`/courses/${scope.id.slice(0, sep)}/lessons/${scope.id.slice(sep + 1)}`];
    }
    case 'english':
      return [`/english/${scope.id}`];
    case 'english-lesson': {
      const sep = scope.id.indexOf('/');
      return [`/english/${scope.id.slice(0, sep)}/lessons/${scope.id.slice(sep + 1)}`];
    }
    case 'chinese':
      return [`/chinese/${scope.id}`];
    case 'chinese-lesson': {
      const sep = scope.id.indexOf('/');
      return [`/chinese/${scope.id.slice(0, sep)}/lessons/${scope.id.slice(sep + 1)}`];
    }
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  let body: { key?: string; passwordHash?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }
  const { key, passwordHash } = body;
  if (typeof key !== 'string' || typeof passwordHash !== 'string') {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
  }
  if (!SHA256_HEX.test(passwordHash)) {
    return NextResponse.json({ ok: false, error: 'invalid_hash_shape' }, { status: 400 });
  }
  const scope = keyToScope(key);
  if (!scope || !scopeIsValid(scope)) {
    return NextResponse.json({ ok: false, error: 'unknown_scope' }, { status: 404 });
  }
  await lockScope(scope, passwordHash);
  for (const p of revalidationPaths(scope)) revalidatePath(p, 'layout');
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  let body: { key?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }
  const { key } = body;
  if (typeof key !== 'string') {
    return NextResponse.json({ ok: false, error: 'missing_fields' }, { status: 400 });
  }
  const scope = keyToScope(key);
  if (!scope || !scopeIsValid(scope)) {
    return NextResponse.json({ ok: false, error: 'unknown_scope' }, { status: 404 });
  }
  await unlockScope(scope);
  for (const p of revalidationPaths(scope)) revalidatePath(p, 'layout');
  return NextResponse.json({ ok: true });
}
