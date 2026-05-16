/**
 * Client-side password hashing using SHA-256.
 *
 * The plaintext password never leaves the browser; only the 64-char hex digest
 * is sent over the network. The server then runs bcrypt.compare on that hex
 * against a stored bcrypt(sha256(password)) hash.
 *
 * Caveat: the hash IS the credential against this server. HTTPS is still the
 * primary defense against network capture. This just keeps the literal
 * plaintext out of devtools, server logs, and curl payloads.
 */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
