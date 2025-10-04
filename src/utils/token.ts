import crypto from 'crypto';
import TokenModel from '../modules/auth/token.model';
import { Types } from 'mongoose';

export const createRandomToken= (bytes = 32) =>crypto.randomBytes(bytes).toString("hex");
export const hashToken = (token: string) => crypto.createHash("sha256").update(token).digest("hex");

// save token hashed with TTL
// save token hashed with TTL seconds
export const saveToken = async (userId: Types.ObjectId, token: string, type: "refresh"|"emailVerify"|"passwordReset", ttlSeconds: number) => {
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  return TokenModel.create({ userId, tokenHash, type, expiresAt });
};

export const findTokenDoc = async (token: string, type: "emailVerify"|"passwordReset"|"refresh") => {
  const tokenHash = hashToken(token);
  return TokenModel.findOne({ tokenHash, type });
};

export const deleteTokenDoc = async (id: string) => TokenModel.findByIdAndDelete(id);
export const deleteUserTokensByType = async (userId: Types.ObjectId, type: string) =>
  TokenModel.deleteMany({ userId, type });