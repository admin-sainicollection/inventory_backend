import crypto from 'crypto';
import { Types } from 'mongoose';
import Token from '../modules/auth/token.model'

export const createRandomToken= (bytes = 32) =>crypto.randomBytes(bytes).toString("hex");
export const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

// save token hashed with TTL
// save token hashed with TTL seconds
export const saveToken = async (
  userId: Types.ObjectId,
  token: string,
  type: "refresh" | "emailVerify" | "passwordReset",
  ttlSeconds: number
): Promise<void> => {
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  
  await Token.create({
      userId,
      tokenHash,
      type,
      expiresAt
  });
};

export const findTokenDoc = async (token: string, type: string) => {
  const tokenHash = hashToken(token);
  return await Token.findOne({
      tokenHash,
      type,
      expiresAt: { $gt: new Date() }
  });
};

export const deleteTokenDoc =async (token: string): Promise<void> => {
  const tokenHash = hashToken(token);
  await Token.deleteOne({ tokenHash });
};

export const deleteUserTokensByType = async (userId: Types.ObjectId, type: string): Promise<void> => {
  await Token.deleteMany({ userId, type });
};