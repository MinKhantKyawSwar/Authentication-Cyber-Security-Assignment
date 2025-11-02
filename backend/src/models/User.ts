import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  passwordHash?: string;
  provider?: "local" | "google";
  googleId?: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: false },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: false },
  provider: { type: String, enum: ["local", "google"], default: "local" },
  googleId: { type: String, required: false },
});

const UserModel = mongoose.model<IUser>("User", userSchema);
export default UserModel;
