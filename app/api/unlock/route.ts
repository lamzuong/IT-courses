import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  grantScopeAccess,
  isScopeLocked,
  keyToScope,
  verifyScopePassword,
} from '@/lib/locks';

export const runtime = 'nodejs';

const SHA256_HEX = /^[a-f0-9]{64}$/;

export async function POST(request: Request) {
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
  if (!scope) {
    return NextResponse.json({ ok: false, error: 'unknown_scope' }, { status: 404 });
  }
  if (!(await isScopeLocked(scope))) {
    return NextResponse.json({ ok: true, alreadyOpen: true });
  }
  const valid = await verifyScopePassword(scope, passwordHash);
  if (!valid) {
    return NextResponse.json({ ok: false, error: 'wrong_password' }, { status: 401 });
  }
  await grantScopeAccess(scope);
  // Revalidate the relevant page so the gate disappears on next render
  switch (scope.kind) {
    case 'course':
      revalidatePath(`/courses/${scope.id}`, 'layout');
      break;
    case 'lesson': {
      const sep = scope.id.indexOf('/');
      revalidatePath(
        `/courses/${scope.id.slice(0, sep)}/lessons/${scope.id.slice(sep + 1)}`,
      );
      break;
    }
    case 'english':
      revalidatePath(`/english/${scope.id}`, 'layout');
      break;
    case 'english-lesson': {
      const sep = scope.id.indexOf('/');
      revalidatePath(
        `/english/${scope.id.slice(0, sep)}/lessons/${scope.id.slice(sep + 1)}`,
      );
      break;
    }
    case 'chinese':
      revalidatePath(`/chinese/${scope.id}`, 'layout');
      break;
    case 'chinese-lesson': {
      const sep = scope.id.indexOf('/');
      revalidatePath(
        `/chinese/${scope.id.slice(0, sep)}/lessons/${scope.id.slice(sep + 1)}`,
      );
      break;
    }
  }
  return NextResponse.json({ ok: true });
}
