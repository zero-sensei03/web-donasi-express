import jwt, { SignOptions } from "jsonwebtoken";
import { Env } from "../config/env";

export interface JwtPayload {
  userId: string;
  role: string;
}

export const generateAccessToken = (payload: JwtPayload): string => {
  const options: SignOptions = { expiresIn: Env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"] };
  return jwt.sign(payload, Env.JWT_ACCESS_SECRET, options);
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  const options: SignOptions = { expiresIn: Env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"] };
  return jwt.sign(payload, Env.JWT_REFRESH_SECRET, options);
};

export const generateAuthTokens = (payload: JwtPayload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, Env.JWT_ACCESS_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, Env.JWT_REFRESH_SECRET) as JwtPayload;
};