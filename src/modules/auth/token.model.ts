// models/Token.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IToken extends Document {
    userId: Schema.Types.ObjectId;
    tokenHash: string;
    type: "refresh" | "emailVerify" | "passwordReset";
    expiresAt: Date;
}

const TokenSchema = new Schema<IToken>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true},
    type: { type: String, enum: ["refresh", "emailVerify", "passwordReset"], required: true },
    expiresAt: { type: Date, required: true}
}, { timestamps: true });

// Auto-delete expired tokens
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IToken>("Token", TokenSchema);