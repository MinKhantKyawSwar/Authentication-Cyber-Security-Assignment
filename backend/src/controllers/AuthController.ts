import { Request, Response } from "express";
import { validationResult } from "express-validator";
import argon2 from "argon2";
import mongoose from "mongoose";
import UserModel from "../models/User";
import TokenService from "../services/TokenService";
import RefreshTokenModel from "../models/RefreshToken";
import { OAuth2Client } from "google-auth-library";
import { mailSender } from "../utils/mail";
import OtpModel from "../models/Otp";
import axios from "axios";

export default class AuthController {
  private googleClient?: OAuth2Client;

  constructor(private tokenService: TokenService) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId) {
      this.googleClient = new OAuth2Client(clientId);
    }
  }

  register = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { captchaToken, name, email, password } = req.body;
    const secret = process.env.RECAPCHA_BACKEND;

    if (!captchaToken) {
      return res.status(400).json({ message: "Missing reCAPTCHA token" });
    }
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${captchaToken}`;
    const { data } = await axios.post(verifyUrl);

    if (!data.success) {
      return res.status(400).json({ message: "reCAPTCHA verification failed" });
    }

    const existing = await UserModel.findOne({ email });
    if (existing) return res.status(409).json({ message: "User exists" });

    const hash = await argon2.hash(password);
    const user = await UserModel.create({ name, email, passwordHash: hash });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name || user.email.split("@")[0],
        email: user.email,
      },
    });
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password, recaptchaToken, loginAttempts } = req.body;

      // Default attempts to 0 if undefined or invalid
      const attempts = Number(loginAttempts) || 0;
      const secret = process.env.RECAPTCHA_BACKEND;

      // Require reCAPTCHA after 3 or more failed attempts
      if (attempts >= 3) {
        if (!recaptchaToken) {
          return res.status(400).json({ error: "reCAPTCHA required" });
        }

        // Verify reCAPTCHA
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${recaptchaToken}`;
        const { data } = await axios.post(verifyUrl);

        if (!data.success) {
          return res
            .status(400)
            .json({ message: "reCAPTCHA verification failed" });
        }
      }

      // Check if user exists
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (!user.passwordHash) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isPasswordCorrect = await argon2.verify(
        user.passwordHash,
        password
      );
      if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate OTP and pause login
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const ttlMs = 5 * 60 * 1000; // 5 minutes
      const now = new Date();

      await OtpModel.create({
        userId: user._id as mongoose.Types.ObjectId,
        code: otpCode,
        createdAt: now,
        expiresAt: new Date(now.getTime() + ttlMs),
        consumed: false,
        status: "pending",
      });

      try {
        await mailSender(
          user.email,
          "Your One-Time Password",
          `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #4a90e2; text-align: center;">Your One-Time Password (OTP)</h2>
          <p>Hi ${user.name || ""},</p>
          <p>Use the following OTP to complete your authentication process. It expires in <b>5 minutes</b>:</p>
          <p style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #4a90e2; letter-spacing: 3px;">${otpCode}</span>
          </p>
          <p>If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply.</p>
        </div>
        `
        );
      } catch (mailErr) {
        console.warn("Login OTP email failed:", mailErr);
      }

      return res.status(202).json({
        message: "OTP sent to email",
        pendingUser: { id: user._id, email: user.email },
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  whoami = async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { name, email } = req.user;
    return res.json({
      name: name || email.split("@")[0],
      email,
    });
  };

  googleLogin = async (req: Request, res: Response) => {
    try {
      const { idToken, authCode } = req.body as {
        idToken?: string;
        authCode?: string;
      };

      if (!this.googleClient) {
        return res.status(500).json({ message: "Google auth not configured" });
      }

      let verifiedPayload: any | null = null;

      if (idToken) {
        const ticket = await this.googleClient.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID as string,
        });
        verifiedPayload = ticket.getPayload();
      } else if (authCode) {
        const clientId = process.env.GOOGLE_CLIENT_ID as string;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET as
          | string
          | undefined;
        if (!clientSecret) {
          return res.status(400).json({
            message: "Missing GOOGLE_CLIENT_SECRET",
          });
        }

        const body = new URLSearchParams({
          code: authCode,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: "postmessage",
          grant_type: "authorization_code",
        });

        const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });

        if (!tokenResp.ok) {
          const text = await tokenResp.text();
          return res
            .status(401)
            .json({ message: "Code exchange failed", detail: text });
        }

        const tokenJson = (await tokenResp.json()) as {
          id_token?: string;
          access_token?: string;
        };

        if (!tokenJson.id_token) {
          return res
            .status(401)
            .json({ message: "No id_token in token response" });
        }

        const ticket = await this.googleClient.verifyIdToken({
          idToken: tokenJson.id_token,
          audience: clientId,
        });
        verifiedPayload = ticket.getPayload();
      } else {
        return res.status(400).json({ message: "Missing idToken or authCode" });
      }
      const payload = verifiedPayload;
      if (!payload || !payload.email || !payload.sub) {
        return res.status(401).json({ message: "Invalid Google token" });
      }

      const email = payload.email.toLowerCase();
      const googleId = payload.sub;
      const name = payload.name || email.split("@")[0];

      let user = await UserModel.findOne({ email });
      if (!user) {
        user = await UserModel.create({
          email,
          name,
          provider: "google",
          googleId,
        });
      } else if (user.provider !== "google") {
        // Link account if previously local
        user.provider = "google";
        user.googleId = googleId;
        await user.save();
      }

      // Generate OTP for Google login and pause session
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const ttlMs = 5 * 60 * 1000;
      const now = new Date();
      await OtpModel.create({
        userId: user._id as mongoose.Types.ObjectId,
        code: otpCode,
        createdAt: now,
        expiresAt: new Date(now.getTime() + ttlMs),
        consumed: false,
        status: "pending",
      });

      try {
        await mailSender(
          email,
          "Your One-Time Password",
          `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
              <h2 style="color: #4a90e2; text-align: center;">Your One-Time Password (OTP)</h2>
              <p>Hi ${user.name || ""},</p>
              <p>Use the following OTP to complete your authentication process. It expires in <b>5 minutes</b>:</p>
              <p style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #4a90e2; letter-spacing: 3px;">${otpCode}</span>
              </p>
              <p>If you did not request this, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply.</p>
            </div>
            `
        );
      } catch (mailErr) {
        console.warn("Google login OTP email failed:", mailErr);
      }

      return res.status(202).json({
        message: "OTP sent to email",
        pendingUser: { id: user._id, email: user.email },
      });
    } catch (err: any) {
      const detail = err?.message || "Unknown error";
      return res
        .status(401)
        .json({ message: "Google authentication failed", detail });
    }
  };

  googleCallback = async (req: Request, res: Response) => {
    try {
      const authCode = (req.query.code as string | undefined) || undefined;
      if (!this.googleClient) {
        return res.status(500).send("Google auth not configured");
      }
      if (!authCode) {
        return res.status(400).send("Missing authorization code");
      }

      const clientId = process.env.GOOGLE_CLIENT_ID as string;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET as
        | string
        | undefined;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI as string | undefined;
      if (!clientSecret || !redirectUri) {
        return res
          .status(400)
          .send("Missing GOOGLE_CLIENT_SECRET or GOOGLE_REDIRECT_URI");
      }

      const body = new URLSearchParams({
        code: authCode,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      });

      const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      if (!tokenResp.ok) {
        const text = await tokenResp.text();
        return res.status(401).send(`Code exchange failed: ${text}`);
      }

      const tokenJson = (await tokenResp.json()) as { id_token?: string };
      if (!tokenJson.id_token) {
        return res.status(401).send("No id_token in token response");
      }

      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokenJson.id_token,
        audience: clientId,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email || !payload.sub) {
        return res.status(401).send("Invalid Google token");
      }

      const email = payload.email.toLowerCase();
      const googleId = payload.sub;
      const name = payload.name || email.split("@")[0];

      let user = await UserModel.findOne({ email });
      if (!user) {
        user = await UserModel.create({
          email,
          name,
          provider: "google",
          googleId,
        });
      } else if (user.provider !== "google") {
        user.provider = "google";
        user.googleId = googleId;
        await user.save();
      }

      // OTP for redirect-based Google login as well
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const ttlMs = 5 * 60 * 1000;
      const now = new Date();
      await OtpModel.create({
        userId: user._id as mongoose.Types.ObjectId,
        code: otpCode,
        createdAt: now,
        expiresAt: new Date(now.getTime() + ttlMs),
        consumed: false,
        status: "pending",
      });

      try {
        await mailSender(
          email,
          "Your One-Time Password",
          `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
    <h2 style="color: #4a90e2; text-align: center;">Your One-Time Password (OTP)</h2>
    <p>Hi ${user.name || ""},</p>
    <p>Use the following OTP to complete your authentication process. It expires in <b>5 minutes</b>:</p>
    <p style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; color: #4a90e2; letter-spacing: 3px;">${otpCode}</span>
    </p>
    <p>If you did not request this, please ignore this email.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply.</p>
  </div>
  `
        );
      } catch (mailErr) {
        console.warn("Google redirect OTP email failed:", mailErr);
      }

      const frontend = process.env.FRONTEND_ORIGIN || "http://localhost:8080";
      const redirectTo = `${frontend}/otp?email=${encodeURIComponent(email)}`;
      return res.redirect(302, redirectTo);
    } catch (err: any) {
      return res
        .status(401)
        .send(`Google authentication failed: ${err?.message || "Unknown"}`);
    }
  };

  verifyOtp = async (req: Request, res: Response) => {
    try {
      const { email, code } = req.body as { email?: string; code?: string };
      if (!code) return res.status(400).json({ message: "Missing code" });

      let user: any = null;
      let otp: any = null;

      if (email) {
        user = await UserModel.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(401).json({ message: "Invalid OTP" });
        // Always validate against the latest OTP for this user
        otp = await OtpModel.findOne({
          userId: user._id,
          consumed: false,
        }).sort({ createdAt: -1 });
        if (!otp || otp.code !== code)
          return res.status(401).json({ message: "Invalid OTP" });
      } else {
        otp = await OtpModel.findOne({ code, consumed: false }).sort({
          createdAt: -1,
        });
        if (!otp) return res.status(401).json({ message: "Invalid OTP" });
        user = await UserModel.findById(otp.userId);
        if (!user) return res.status(401).json({ message: "Invalid OTP" });
      }

      if (!otp) return res.status(401).json({ message: "Invalid OTP" });

      if (otp.expiresAt.getTime() < Date.now()) {
        otp.consumed = true;
        otp.status = "expired";
        await otp.save();
        return res.status(401).json({ message: "OTP expired" });
      }

      otp.consumed = true;
      otp.status = "used";
      await otp.save();

      const token = await this.tokenService.createAccessToken(user._id as any);
      const refreshToken = await this.tokenService.createRefreshToken(
        user._id as any
      );

      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      res.cookie("rt", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/auth/refresh",
        maxAge: thirtyDaysMs,
      });

      return res.json({
        accessToken: token,
        user: {
          id: user._id,
          name: user.name || user.email.split("@")[0],
          email: user.email,
        },
      });
    } catch (e) {
      return res.status(500).json({ message: "Failed to verify OTP" });
    }
  };

  refresh = async (req: Request, res: Response) => {
    try {
      const refreshToken = (req as any).cookies?.rt as string | undefined;
      const userId = (req.body as any)?.userId as string | undefined;
      if (!refreshToken || !userId) {
        return res
          .status(400)
          .json({ message: "Missing refresh token or userId" });
      }

      const record = await this.tokenService.verifyRefreshToken(
        userId,
        refreshToken
      );

      const accessToken = await this.tokenService.createAccessToken(
        record.userId as any
      );

      // Rotate: revoke old and set new cookie
      const newRefresh = await this.tokenService.createRefreshToken(
        record.userId as any
      );
      record.isValid = true;
      await record.save();

      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      res.cookie("rt", newRefresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/api/auth/refresh",
        maxAge: thirtyDaysMs,
      });

      return res.json({ accessToken });
    } catch (e: any) {
      return res.status(401).json({ message: e?.message || "Refresh failed" });
    }
  };

  logout = async (req: Request, res: Response) => {
    try {
      const refreshToken = (req as any).cookies?.rt as string | undefined;
      const userId = (req.body as any)?.userId as string | undefined;
      if (refreshToken && userId) {
        try {
          const record = await this.tokenService.verifyRefreshToken(
            userId,
            refreshToken
          );
          record.isValid = true;
          await record.save();
        } catch {
          // ignore if already invalid
        }
      }
      res.clearCookie("rt", { path: "/api/auth/refresh" });
      return res.status(200).json({ message: "Logged out" });
    } catch {
      return res.status(200).json({ message: "Logged out" });
    }
  };

  resendOtp = async (req: Request, res: Response) => {
    try {
      const { email } = req.body as { email?: string };
      if (!email) return res.status(400).json({ message: "Missing email" });

      const user = await UserModel.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(404).json({ message: "User not found" });

      // Invalidate previous unconsumed OTPs
      await OtpModel.updateMany(
        { userId: user._id, consumed: false },
        { $set: { consumed: true } }
      );

      // Create new OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const ttlMs = 5 * 60 * 1000;
      const now = new Date();
      await OtpModel.create({
        userId: user._id as mongoose.Types.ObjectId,
        code: otpCode,
        createdAt: now,
        expiresAt: new Date(now.getTime() + ttlMs),
        consumed: false,
      });

      try {
        await mailSender(
          user.email,
          "Your One-Time Password",
          `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9;">
              <h2 style="color: #4a90e2; text-align: center;">Your One-Time Password (OTP)</h2>
              <p>Hi ${user.name || ""},</p>
              <p>Use the following OTP to complete your authentication process. It expires in <b>5 minutes</b>:</p>
              <p style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #4a90e2; letter-spacing: 3px;">${otpCode}</span>
              </p>
              <p>If you did not request this, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply.</p>
            </div>
            `
        );
      } catch (mailErr) {
        console.warn("Resend OTP email failed:", mailErr);
      }

      return res.json({ message: "OTP resent" });
    } catch (e) {
      return res.status(500).json({ message: "Failed to resend OTP" });
    }
  };

  securityAudit = async (req: Request, res: Response) => {
    if (!req.user)
      return res.status(401).json({ message: "User is unauthorized." });

    const userId = req.user.id;
    const records = await RefreshTokenModel.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .sort({ updatedAt: -1 })
      .limit(20);

    const events = records
      .flatMap((r) => {
        const arr: Array<{
          type: string;
          at: Date;
          meta?: Record<string, unknown>;
        }> = [];
        arr.push({
          type: "Refresh token issued",
          at: r.createdAt,
          meta: { deviceInfo: r.deviceInfo, ip: r.ipAddress },
        });
        if (r.isValid) {
          arr.push({
            type: "Session is valid.",
            at: r.updatedAt,
            meta: { deviceInfo: r.deviceInfo, ip: r.ipAddress },
          });
        }
        if (r.hashedTokenReplacement) {
          arr.push({
            type: "Token replaced",
            at: r.updatedAt,
            meta: { deviceInfo: r.deviceInfo, ip: r.ipAddress },
          });
        }
        return arr;
      })
      .sort((a, b) => b.at.getTime() - a.at.getTime())
      .slice(0, 20);

    return res.json(
      events.map((e) => ({
        type: e.type,
        at: e.at,
        userAgent: e.meta?.userAgent as string | undefined,
        ip: e.meta?.ip as string | undefined,
      }))
    );
  };
}
