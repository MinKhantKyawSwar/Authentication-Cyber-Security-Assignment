import { SignJWT, jwtVerify, generateKeyPair } from "jose";
import { randomUUID } from "crypto";
import argon2 from "argon2";
import TokenModel from "../models/Token";
import mongoose from "mongoose";
import RefreshTokenModel from "../models/RefreshToken";

// Web Crypto API types
declare global {
  interface CryptoKey {}
}

export default class TokenService {
  private privateKey: CryptoKey;
  private publicKey: CryptoKey;

  constructor(privateKey: CryptoKey, publicKey: CryptoKey) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  static async init() {
    const { privateKey, publicKey } = await generateKeyPair("RS256");
    return new TokenService(privateKey, publicKey);
  }

  private async hashJti(jti: string) {
    return argon2.hash(jti);
  }

  private async hashToken(token: string) {
    return argon2.hash(token);
  }

  private async verifyTokenHash(hash: string, raw: string) {
    return argon2.verify(hash, raw);
  }

  async createAccessToken(
    userId: mongoose.Types.ObjectId,
    expiresIn = 900 // 15 minutes in seconds
  ) {
    const jti = randomUUID();
    const now = Math.floor(Date.now() / 1000);

    const token = await new SignJWT({ sub: userId.toString() })
      .setProtectedHeader({ alg: "RS256" })
      .setIssuedAt(now)
      .setIssuer("https://auth.local")
      .setAudience("https://api.local")
      .setJti(jti)
      .setExpirationTime(now + expiresIn)
      .sign(this.privateKey);

    const jtiHash = await this.hashJti(jti);

    const tokenRecord = await TokenModel.create({
      userId,
      jtiHash,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
    });

    return token;
  }

  async verifyAccessToken(token: string) {
    try {
      const { payload } = await jwtVerify(token, this.publicKey, {
        issuer: "https://auth.local",
        audience: "https://api.local",
      });

      const jti = payload.jti as string;
      const userId = payload.sub as string;

      // Find all token records for this user and check if any match the JTI
      const tokenRecords = await TokenModel.find({
        userId: new mongoose.Types.ObjectId(userId),
      });

      if (!tokenRecords || tokenRecords.length === 0) {
        throw new Error("Token not found");
      }

      // Check if any of the token records match the JTI
      let validToken = false;
      for (const tokenRecord of tokenRecords) {
        try {
          const valid = await argon2.verify(tokenRecord.jtiHash, jti);
          if (valid) {
            validToken = true;
            break;
          }
        } catch (err) {
          continue;
        }
      }

      if (!validToken) {
        throw new Error("Invalid or revoked token");
      }

      return { userId, payload };
    } catch (err) {
      throw err;
    }
  }

  async createRefreshToken(userId: mongoose.Types.ObjectId) {
    const expiresInDays = 30;
    // Use a strong random token (UUID v4 is ok here; could switch to 32-byte random string)
    const refreshToken = randomUUID();
    const hashedToken = await this.hashToken(refreshToken);
    const expiresAt = new Date(
      Date.now() + expiresInDays * 24 * 60 * 60 * 1000
    );

    await RefreshTokenModel.create({
      userId,
      hashedToken,
      expiresAt,
    });

    return refreshToken;
  }

  async renewRefreshToken(
    userId: mongoose.Types.ObjectId,
    currentToken: string,
    expiresInDays = 30
  ) {
    const tokens = await RefreshTokenModel.find({ userId, isValid: false });
    let matched: (typeof tokens)[number] | null = null;
    for (const t of tokens) {
      const ok = await this.verifyTokenHash(t.hashedToken, currentToken);
      if (ok) {
        matched = t;
        break;
      }
    }
    if (!matched) throw new Error("Refresh token invalid");

    // Revoke the old token and create a new one
    const newRefreshToken = randomUUID();
    const newHash = await this.hashToken(newRefreshToken);
    const newExpires = new Date(
      Date.now() + expiresInDays * 24 * 60 * 60 * 1000
    );

    matched.isValid = true;
    matched.hashedTokenReplacement = newHash;
    await matched.save();

    await RefreshTokenModel.create({
      userId,
      hashedToken: newHash,
      expiresAt: newExpires,
    });

    return newRefreshToken;
  }

  async verifyRefreshToken(userId: string, refreshToken: string) {
    const records = await RefreshTokenModel.find({
      userId: new mongoose.Types.ObjectId(userId),
      isValid: false,
    });
    if (!records.length) throw new Error("Refresh token not found");

    for (const r of records) {
      const ok = await this.verifyTokenHash(r.hashedToken, refreshToken);
      if (ok) {
        if (r.expiresAt.getTime() < Date.now())
          throw new Error("Refresh token expired");
        return r;
      }
    }

    throw new Error("Refresh token invalid");
  }
}
