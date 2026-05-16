import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { cookies } from 'next/headers';
import { compare, hash } from 'bcryptjs';
import { createHmac, timingSafeEqual } from 'node:crypto';

const STORE_PATH = path.join(process.cwd(), 'data', 'locks.json');
const LEGACY_PATH = path.join(process.cwd(), 'data', 'lesson-locks.json');
const BCRYPT_ROUNDS = 10;
const ACCESS_TTL_DAYS = 7;
const ACCESS_COOKIE_PREFIX = 'access_';

export type ScopeKind =
  | 'course'
  | 'lesson'
  | 'english'
  | 'english-lesson'
  | 'chinese'
  | 'chinese-lesson';

const VALID_KINDS: ScopeKind[] = [
  'course',
  'lesson',
  'english',
  'english-lesson',
  'chinese',
  'chinese-lesson',
];

/** A scope is `<kind>/<id>` where id may itself contain slashes (e.g. lesson). */
export type Scope = { kind: ScopeKind; id: string };

export function scopeToKey(scope: Scope): string {
  return `${scope.kind}/${scope.id}`;
}

export function keyToScope(key: string): Scope | null {
  const sep = key.indexOf('/');
  if (sep === -1) return null;
  const kind = key.slice(0, sep) as ScopeKind;
  const id = key.slice(sep + 1);
  if (!VALID_KINDS.includes(kind) || !id) return null;
  return { kind, id };
}

/** Cookie names can't include '/' — replace with '__'. Stays unique per scope. */
function cookieName(scope: Scope): string {
  return ACCESS_COOKIE_PREFIX + scopeToKey(scope).replace(/\//g, '__');
}

type LockEntry = { passwordHash: string; lockedAt: string };
type Store = Record<string, LockEntry>;

function lockSecret(): string {
  const s = process.env.ADMIN_PASSWORD_HASH;
  if (!s || s.length < 16) {
    throw new Error('ADMIN_PASSWORD_HASH is missing or too short.');
  }
  return s;
}

async function readStore(): Promise<Store> {
  // Try canonical store first; fall back to legacy lesson-locks.json on first read.
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf8');
    return JSON.parse(raw) as Store;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
  }
  try {
    const rawLegacy = await fs.readFile(LEGACY_PATH, 'utf8');
    const legacy = JSON.parse(rawLegacy) as Record<string, LockEntry>;
    // Legacy entries were keyed by '<course>/<lesson>'. Map them to 'lesson/<course>/<lesson>'.
    const migrated: Store = {};
    for (const [k, v] of Object.entries(legacy)) {
      migrated[`lesson/${k}`] = v;
    }
    return migrated;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw err;
  }
}

async function writeStore(store: Store): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2) + '\n', 'utf8');
}

export async function getAllLocks(): Promise<Record<string, { lockedAt: string }>> {
  const store = await readStore();
  const out: Record<string, { lockedAt: string }> = {};
  for (const [k, entry] of Object.entries(store)) {
    out[k] = { lockedAt: entry.lockedAt };
  }
  return out;
}

export async function isScopeLocked(scope: Scope): Promise<boolean> {
  const store = await readStore();
  return Boolean(store[scopeToKey(scope)]);
}

export async function lockScope(scope: Scope, passwordHash: string): Promise<void> {
  if (!passwordHash) throw new Error('passwordHash required.');
  const store = await readStore();
  store[scopeToKey(scope)] = {
    passwordHash: await hash(passwordHash, BCRYPT_ROUNDS),
    lockedAt: new Date().toISOString(),
  };
  await writeStore(store);
}

export async function unlockScope(scope: Scope): Promise<void> {
  const store = await readStore();
  delete store[scopeToKey(scope)];
  await writeStore(store);
}

export async function verifyScopePassword(scope: Scope, passwordHash: string): Promise<boolean> {
  const store = await readStore();
  const entry = store[scopeToKey(scope)];
  if (!entry) return true;
  return compare(passwordHash, entry.passwordHash);
}

function signAccess(scope: Scope): string {
  const expiresAt = Date.now() + ACCESS_TTL_DAYS * 24 * 60 * 60 * 1000;
  const payload = `${scopeToKey(scope)}:${expiresAt}`;
  const mac = createHmac('sha256', lockSecret()).update(payload).digest('hex');
  return `${payload}.${mac}`;
}

function verifyAccessToken(scope: Scope, token: string): boolean {
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
  if (ref !== scopeToKey(scope)) return false;
  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  return true;
}

export async function grantScopeAccess(scope: Scope): Promise<void> {
  const token = signAccess(scope);
  const jar = await cookies();
  jar.set(cookieName(scope), token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ACCESS_TTL_DAYS * 24 * 60 * 60,
  });
}

export async function hasScopeAccess(scope: Scope): Promise<boolean> {
  if (!(await isScopeLocked(scope))) return true;
  const jar = await cookies();
  const token = jar.get(cookieName(scope))?.value;
  if (!token) return false;
  return verifyAccessToken(scope, token);
}

/**
 * Returns the first scope in the given order that's locked AND the visitor lacks
 * access to. Returns null if all scopes pass (none locked or all unlocked).
 *
 * Use this on hierarchical pages — e.g. for a course lesson, check the course
 * scope first, then the lesson scope. Outer gates take precedence.
 */
export async function firstBlockingScope(scopes: Scope[]): Promise<Scope | null> {
  for (const scope of scopes) {
    if (!(await hasScopeAccess(scope))) return scope;
  }
  return null;
}
