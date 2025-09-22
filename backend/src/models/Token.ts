import mongoose, { Schema, Document } from "mongoose";

export interface IToken extends Document {
  userId: mongoose.Types.ObjectId;
  jtiHash: string;
  expiresAt: Date;
}

const tokenSchema = new Schema<IToken>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  jtiHash: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

const TokenModel = mongoose.model<IToken>("Token", tokenSchema);
export default TokenModel;
