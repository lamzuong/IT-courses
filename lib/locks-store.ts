import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Redis } from '@upstash/redis';

export type LockEntry = { passwordHash: string; lockedAt: string };

export interface LockStore {
  readonly kind: 'upstash' | 'filesystem';
  getAll(): Promise<Record<string, LockEntry>>;
  get(key: string): Promise<LockEntry | null>;
  set(key: string, entry: LockEntry): Promise<void>;
  delete(key: string): Promise<void>;
}

// ── Upstash backend ──────────────────────────────────────────────────────────
// Stores every lock under a single Redis Hash `locks` so we can read all in one
// HGETALL. Works with both Vercel KV (which is Upstash under the hood) and any
// Upstash project — Redis.fromEnv() reads KV_REST_API_URL / KV_REST_API_TOKEN.

class UpstashStore implements LockStore {
  readonly kind = 'upstash' as const;
  private redis: Redis;
  private static readonly HASH_KEY = 'locks';

  constructor() {
    this.redis = Redis.fromEnv();
  }

  async getAll(): Promise<Record<string, LockEntry>> {
    const raw = (await this.redis.hgetall<Record<string, LockEntry | string>>(
      UpstashStore.HASH_KEY,
    )) ?? {};
    const out: Record<string, LockEntry> = {};
    for (const [k, v] of Object.entries(raw)) {
      // Upstash SDK auto-parses JSON when possible, but be defensive.
      out[k] = typeof v === 'string' ? (JSON.parse(v) as LockEntry) : v;
    }
    return out;
  }

  async get(key: string): Promise<LockEntry | null> {
    const v = await this.redis.hget<LockEntry | string>(UpstashStore.HASH_KEY, key);
    if (v == null) return null;
    return typeof v === 'string' ? (JSON.parse(v) as LockEntry) : v;
  }

  async set(key: string, entry: LockEntry): Promise<void> {
    await this.redis.hset(UpstashStore.HASH_KEY, { [key]: JSON.stringify(entry) });
  }

  async delete(key: string): Promise<void> {
    await this.redis.hdel(UpstashStore.HASH_KEY, key);
  }
}

// ── Filesystem backend (dev only — does not survive serverless cold starts) ──

class FilesystemStore implements LockStore {
  readonly kind = 'filesystem' as const;
  private filePath = path.join(process.cwd(), 'data', 'locks.json');
  private legacyPath = path.join(process.cwd(), 'data', 'lesson-locks.json');

  private async read(): Promise<Record<string, LockEntry>> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(raw) as Record<string, LockEntry>;
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
    // Legacy migration: old lesson-locks.json mapped course/lesson keys; promote
    // them to the new `lesson/<course>/<lesson>` namespace on first read.
    try {
      const raw = await fs.readFile(this.legacyPath, 'utf8');
      const legacy = JSON.parse(raw) as Record<string, LockEntry>;
      const migrated: Record<string, LockEntry> = {};
      for (const [k, v] of Object.entries(legacy)) {
        migrated[`lesson/${k}`] = v;
      }
      return migrated;
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') return {};
      throw err;
    }
  }

  private async write(store: Record<string, LockEntry>): Promise<void> {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(store, null, 2) + '\n', 'utf8');
  }

  async getAll() {
    return this.read();
  }

  async get(key: string) {
    const store = await this.read();
    return store[key] ?? null;
  }

  async set(key: string, entry: LockEntry) {
    const store = await this.read();
    store[key] = entry;
    await this.write(store);
  }

  async delete(key: string) {
    const store = await this.read();
    delete store[key];
    await this.write(store);
  }
}

// ── Backend selection ────────────────────────────────────────────────────────
// Choose Upstash if its env vars are present (Vercel KV integration or any
// Upstash project). Otherwise fall back to the local filesystem (dev only).
// One warning at module init makes it obvious when the wrong backend is active.

let cached: LockStore | null = null;

export function getLockStore(): LockStore {
  if (cached) return cached;
  const hasUpstash =
    Boolean(process.env.KV_REST_API_URL) && Boolean(process.env.KV_REST_API_TOKEN);
  if (hasUpstash) {
    cached = new UpstashStore();
    return cached;
  }
  cached = new FilesystemStore();
  // Warn only in serverless production where the fs store actually breaks.
  // Railway/Render/Fly run a single long-lived container; with a mounted
  // volume the fs store is fine, so we skip the warning when we detect one.
  if (process.env.NODE_ENV === 'production') {
    const isLongRunningContainer =
      Boolean(process.env.RAILWAY_PROJECT_ID) ||
      Boolean(process.env.RENDER) ||
      Boolean(process.env.FLY_APP_NAME) ||
      process.env.LOCK_STORE === 'fs';
    if (!isLongRunningContainer) {
      console.warn(
        '[locks] No KV_REST_API_URL / KV_REST_API_TOKEN — filesystem store is active. ' +
          'On serverless hosts (Vercel/Netlify) this does NOT persist across instances. ' +
          'Set LOCK_STORE=fs to silence this warning, or connect Upstash Redis.',
      );
    }
  }
  return cached;
}
