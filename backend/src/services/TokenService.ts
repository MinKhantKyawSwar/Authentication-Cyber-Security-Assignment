import { SignJWT, jwtVerify, generateKeyPair } from "jose";
import { randomUUID } from "crypto";
import argon2 from "argon2";
import TokenModel from "../models/Token";
import mongoose from "mongoose";

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

  async createAccessToken(
    userId: mongoose.Types.ObjectId,
    expiresIn = 60 * 60
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
}
