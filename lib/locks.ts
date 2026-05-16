import 'server-only';
import { cookies } from 'next/headers';
import { compare, hash } from 'bcryptjs';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getLockStore, type LockEntry } from '@/lib/locks-store';

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

function cookieName(scope: Scope): string {
  return ACCESS_COOKIE_PREFIX + scopeToKey(scope).replace(/\//g, '__');
}

function lockSecret(): string {
  const s = process.env.ADMIN_PASSWORD_HASH;
  if (!s || s.length < 16) {
    throw new Error('ADMIN_PASSWORD_HASH is missing or too short.');
  }
  return s;
}

export async function getAllLocks(): Promise<Record<string, { lockedAt: string }>> {
  const entries = await getLockStore().getAll();
  const out: Record<string, { lockedAt: string }> = {};
  for (const [k, v] of Object.entries(entries)) {
    out[k] = { lockedAt: v.lockedAt };
  }
  return out;
}

export async function isScopeLocked(scope: Scope): Promise<boolean> {
  const entry = await getLockStore().get(scopeToKey(scope));
  return Boolean(entry);
}

export async function lockScope(scope: Scope, passwordHash: string): Promise<void> {
  if (!passwordHash) throw new Error('passwordHash required.');
  const entry: LockEntry = {
    passwordHash: await hash(passwordHash, BCRYPT_ROUNDS),
    lockedAt: new Date().toISOString(),
  };
  await getLockStore().set(scopeToKey(scope), entry);
}

export async function unlockScope(scope: Scope): Promise<void> {
  await getLockStore().delete(scopeToKey(scope));
}

export async function verifyScopePassword(
  scope: Scope,
  passwordHash: string,
): Promise<boolean> {
  const entry = await getLockStore().get(scopeToKey(scope));
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

export async function firstBlockingScope(scopes: Scope[]): Promise<Scope | null> {
  for (const scope of scopes) {
    if (!(await hasScopeAccess(scope))) return scope;
  }
  return null;
}
