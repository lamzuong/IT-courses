import "server-only";
import { cookies } from "next/headers";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const ADMIN_COOKIE = "admin_session";
const SESSION_TTL_DAYS = 7;

function sessionSecret(): string {
  // The admin password hash doubles as the HMAC key for signed cookies.
  // It's already secret, server-side, per-deployment, and rotating the password
  // naturally invalidates every active session.
  const s = process.env.ADMIN_PASSWORD_HASH;
  if (!s || s.length < 16) {
    throw new Error(
      "ADMIN_PASSWORD_HASH is missing or too short. Set it in .env.local (generate via /admin/setup).",
    );
  }
  return s;
}

function sign(payload: string): string {
  const mac = createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("hex");
  return `${payload}.${mac}`;
}

function verify(signed: string): string | null {
  const idx = signed.lastIndexOf(".");
  if (idx === -1) return null;
  const payload = signed.slice(0, idx);
  const mac = signed.slice(idx + 1);
  const expected = createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("hex");
  if (mac.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(mac, "hex"), Buffer.from(expected, "hex")))
    return null;
  return payload;
}

export async function verifyAdminCredentials(
  username: string,
  password: string,
): Promise<boolean> {
  const u = process.env.ADMIN_USERNAME;
  const h = process.env.ADMIN_PASSWORD_HASH;
  if (!u || !h) return false;
  if (username !== u) return false;
  return password === h;
}

export async function createAdminSession(): Promise<void> {
  const expiresAt = Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
  const nonce = randomBytes(16).toString("hex");
  const payload = `admin:${expiresAt}:${nonce}`;
  const token = sign(payload);
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const payload = verify(token);
  if (!payload) return false;
  const [kind, expiresAtStr] = payload.split(":");
  if (kind !== "admin") return false;
  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  return true;
}

