import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  passwordHash?: string;
  provider?: "local" | "google";
  googleId?: string;
  faceScanEnabled?: boolean;
  faceScanData?: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: false }, // Make optional for existing users
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: false },
  provider: { type: String, enum: ["local", "google"], default: "local" },
  googleId: { type: String, required: false },
  faceScanEnabled: { type: Boolean, default: false },
  faceScanData: { type: String, required: false },
});

const UserModel = mongoose.model<IUser>("User", userSchema);
export default UserModel;
