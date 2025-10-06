import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import {
  JWT_EXPIRES_IN,
  JWT_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
} from "./env";

export const signAccessToken = (payload: object): string => {
  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload | string => {
  return jwt.verify(token, JWT_SECRET as string);
};

export const signRefreshToken = (payload: object): string => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET as string, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  } as SignOptions);
};

export const verifyRefreshToken = (token: string): JwtPayload | string => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET as string);
};
