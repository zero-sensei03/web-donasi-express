import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Meng-hash password teks biasa menjadi hash bcrypt yang aman.
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Membandingkan password teks biasa dengan hash yang tersimpan di database.
 */
export const comparePassword = async (
  plainText: string,
  hashedText: string
): Promise<boolean> => {
  return await bcrypt.compare(plainText, hashedText);
};