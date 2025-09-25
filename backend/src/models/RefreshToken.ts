import mongoose, { Schema, Document } from "mongoose";

export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;
  hashedToken: string;
  expiresAt: Date;
  isValid: boolean;
  hashedTokenReplacement?: string;
  deviceInfo?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    hashedToken: { type: String, unique: true, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    isValid: { type: Boolean, default: false },
    hashedTokenReplacement: { type: String },
    deviceInfo: { type: String },
    ipAddress: { type: String },
  },
  { timestamps: true }
);

const RefreshTokenModel = mongoose.model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema
);
export default RefreshTokenModel;
