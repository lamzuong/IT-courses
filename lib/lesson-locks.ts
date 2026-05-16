import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { cookies } from 'next/headers';
import { compare, hash } from 'bcryptjs';
import { createHmac, timingSafeEqual } from 'node:crypto';

const STORE_PATH = path.join(process.cwd(), 'data', 'lesson-locks.json');
const BCRYPT_ROUNDS = 10;
const ACCESS_TTL_DAYS = 7;
const ACCESS_COOKIE_PREFIX = 'lesson_access_';

type LessonLockEntry = { passwordHash: string; lockedAt: string };
type Store = Record<string, LessonLockEntry>;

function key(courseSlug: string, lessonSlug: string): string {
  return `${courseSlug}/${lessonSlug}`;
}

function cookieName(courseSlug: string, lessonSlug: string): string {
  // Cookie names can't contain '/'; use a separator unlikely in slugs
  return `${ACCESS_COOKIE_PREFIX}${courseSlug}__${lessonSlug}`;
}

function lockSecret(): string {
  // Reuse ADMIN_PASSWORD_HASH as the HMAC key for lesson access cookies —
  // already secret, server-side, and per-deployment. Rotating the admin
  // password invalidates every active lesson unlock too.
  const s = process.env.ADMIN_PASSWORD_HASH;
  if (!s || s.length < 16) {
    throw new Error('ADMIN_PASSWORD_HASH is missing or too short.');
  }
  return s;
}

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    return JSON.parse(raw) as Store;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw err;
  }
}

async function writeStore(store: Store): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2) + '\n', 'utf8');
}

export async function getAllLessonLocks(): Promise<Record<string, { lockedAt: string }>> {
  const store = await readStore();
  const out: Record<string, { lockedAt: string }> = {};
  for (const [k, entry] of Object.entries(store)) {
    out[k] = { lockedAt: entry.lockedAt };
  }
  return out;
}

export async function isLessonLocked(courseSlug: string, lessonSlug: string): Promise<boolean> {
  const store = await readStore();
  return Boolean(store[key(courseSlug, lessonSlug)]);
}

export async function lockLesson(
  courseSlug: string,
  lessonSlug: string,
  password: string,
): Promise<void> {
  if (!courseSlug || !lessonSlug) throw new Error('Course + lesson slug required.');
  if (!password || password.length < 4) {
    throw new Error('Password must be at least 4 characters.');
  }
  const store = await readStore();
  store[key(courseSlug, lessonSlug)] = {
    passwordHash: await hash(password, BCRYPT_ROUNDS),
    lockedAt: new Date().toISOString(),
  };
  await writeStore(store);
}

export async function unlockLesson(courseSlug: string, lessonSlug: string): Promise<void> {
  const store = await readStore();
  delete store[key(courseSlug, lessonSlug)];
  await writeStore(store);
}

export async function verifyLessonPassword(
  courseSlug: string,
  lessonSlug: string,
  password: string,
): Promise<boolean> {
  const store = await readStore();
  const entry = store[key(courseSlug, lessonSlug)];
  if (!entry) return true;
  return compare(password, entry.passwordHash);
}

function signAccess(courseSlug: string, lessonSlug: string): string {
  const expiresAt = Date.now() + ACCESS_TTL_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${courseSlug}/${lessonSlug}:${expiresAt}`;
  const mac = createHmac('sha256', lockSecret()).update(payload).digest('hex');
  return `${payload}.${mac}`;
}

function verifyAccessToken(courseSlug: string, lessonSlug: string, token: string): boolean {
  const idx = token.lastIndexOf('.');
  if (idx === -1) return false;
  const payload = token.slice(0, idx);
  const mac = token.slice(idx + 1);
  const expected = createHmac('sha256', lockSecret()).update(payload).digest('hex');
  if (mac.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(mac, 'hex'), Buffer.from(expected, 'hex'))) return false;
  const sep = payload.lastIndexOf(':');
  if (sep === -1) return false;
  const ref = payload.slice(0, sep);
  const expiresAtStr = payload.slice(sep + 1);
  if (ref !== `${courseSlug}/${lessonSlug}`) return false;
  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  return true;
}

export async function grantLessonAccess(courseSlug: string, lessonSlug: string): Promise<void> {
  const token = signAccess(courseSlug, lessonSlug);
  const jar = await cookies();
  jar.set(cookieName(courseSlug, lessonSlug), token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ACCESS_TTL_DAYS * 24 * 60 * 60,
  });
}

export async function hasLessonAccess(courseSlug: string, lessonSlug: string): Promise<boolean> {
  if (!(await isLessonLocked(courseSlug, lessonSlug))) return true;
  const jar = await cookies();
  const token = jar.get(cookieName(courseSlug, lessonSlug))?.value;
  if (!token) return false;
  return verifyAccessToken(courseSlug, lessonSlug, token);
}
