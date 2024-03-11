import crypto from "crypto";

const SALT_LENGTH = 32;

function generateSalt() {
  return crypto.randomBytes(SALT_LENGTH).toString("hex");
}

function generateCsrfToken(salt: string, secret: string) {
  const hash = crypto
    .createHash("sha256")
    .update(salt + secret)
    .digest("hex");

  return salt + hash;
}

export function createCsrfToken(secret: string) {
  const salt = generateSalt();
  return generateCsrfToken(salt, secret);
}

export function validateCsrfToken(token: string | undefined, secret: string) {
  if ("string" != typeof token) return false;
  const salt = token.slice(0, SALT_LENGTH * 2);

  return token === generateCsrfToken(salt, secret);
}
