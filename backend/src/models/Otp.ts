import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
  userId: mongoose.Types.ObjectId;
  code: string;
  createdAt: Date;
  expiresAt: Date;
  consumed: boolean;
  status?: "pending" | "used" | "expired";
}

const otpSchema = new Schema<IOtp>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  code: { type: String, required: true },
  createdAt: { type: Date, required: true, default: () => new Date() },
  expiresAt: { type: Date, required: true },
  consumed: { type: Boolean, required: true, default: false },
  status: { type: String, enum: ["pending", "used", "expired"], default: "pending", index: true },
});

otpSchema.index({ userId: 1, consumed: 1 });

const OtpModel = mongoose.model<IOtp>("Otp", otpSchema);
export default OtpModel;


