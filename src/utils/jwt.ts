import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";

import { Env } from "../config/env";

export interface JwtPayload {
    userId: string;
    role: string;
    jti: string;
}

const revokedTokens = new Set<string>();

export const generateAccessToken = (payload: Omit<JwtPayload, "jti">): string => {
    const options: SignOptions = {
        expiresIn: Env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
        jwtid: crypto.randomUUID(),
    };

    return jwt.sign(payload, Env.JWT_ACCESS_SECRET, options);
};

export const generateRefreshToken = (payload: Omit<JwtPayload, "jti">): string => {
    const options: SignOptions = {
        expiresIn: Env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
        jwtid: crypto.randomUUID(),
    };

    return jwt.sign(payload, Env.JWT_REFRESH_SECRET, options);
};

export const generateAuthTokens = (
    payload: Omit<JwtPayload, "jti">
) => {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
};

export const verifyAccessToken = (token: string): JwtPayload => {
    const payload = jwt.verify(
        token,
        Env.JWT_ACCESS_SECRET
    ) as JwtPayload;

    if (revokedTokens.has(payload.jti)) {
        throw new Error("Access token telah direvoke");
    }

    return payload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
    const payload = jwt.verify(
        token,
        Env.JWT_REFRESH_SECRET
    ) as JwtPayload;

    if (revokedTokens.has(payload.jti)) {
        throw new Error("Refresh token telah direvoke");
    }

    return payload;
};

export const revokeToken = (token: string): void => {
    const decoded = jwt.decode(token) as JwtPayload | null;

    if (!decoded?.jti) {
        return;
    }

    revokedTokens.add(decoded.jti);
};

export const isTokenRevoked = (token: string): boolean => {
    const decoded = jwt.decode(token) as JwtPayload | null;

    if (!decoded?.jti) {
        return false;
    }

    return revokedTokens.has(decoded.jti);
};