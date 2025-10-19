import * as crypto from 'crypto';

/**
 * Hashes a password using SHA-256 with a salt
 * @param password The password to hash
 * @returns The hashed password
 */
export function hashPassword(password: string): string {
  // Simple salt to make it harder to crack - in a production app you'd use a per-user salt stored in the database
  const salt = 'sparklab-event-2025';
  const hash = crypto.createHash('sha256');
  hash.update(password + salt);
  return hash.digest('hex');
}

/**
 * Verifies a password against a hash
 * @param password The password to verify
 * @param hash The hash to verify against
 * @returns Whether the password is correct
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}