import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';

const BCRYPT_COST = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Dummy compare for timing equalization on invalid email
export async function dummyPasswordCompare(): Promise<void> {
  await bcrypt.compare('dummy-password-for-timing', '$2a$12$e8Y6lYm8wz.sL6yK2bIe3e3b7r0GvFh5j7k9l1m3n5p7q9r1s3t5u');
}

// SHA-256 hash for refresh tokens, job description hashing, etc.
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

// Random token generation (48 bytes base64url for refresh token)
export function generateRandomToken(bytes = 48): string {
  return crypto.randomBytes(bytes).toString('base64url');
}
