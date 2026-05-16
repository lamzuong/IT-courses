import { NextResponse } from "next/server";
import { createAdminSession, verifyAdminCredentials } from "@/lib/admin-auth";

export const runtime = "nodejs";

const SHA256_HEX = /^[a-f0-9]{64}$/;

export async function POST(request: Request) {
  let body: { username?: string; passwordHash?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_body" },
      { status: 400 },
    );
  }
  const { username, passwordHash } = body;
  if (typeof username !== "string" || typeof passwordHash !== "string") {
    return NextResponse.json(
      { ok: false, error: "missing_fields" },
      { status: 400 },
    );
  }
  if (!SHA256_HEX.test(passwordHash)) {
    return NextResponse.json(
      { ok: false, error: "invalid_hash_shape" },
      { status: 400 },
    );
  }
  const ok = await verifyAdminCredentials(username, passwordHash);
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "invalid_credentials1" },
      { status: 401 },
    );
  }
  await createAdminSession();
  return NextResponse.json({ ok: true });
}

