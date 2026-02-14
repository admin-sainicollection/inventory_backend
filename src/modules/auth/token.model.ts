import mongoose, { Schema, Document } from 'mongoose';

export interface IToken extends Document {
    userId: Schema.Types.ObjectId;
    tokenHash: string;
    type: "refresh" | "emailverify" | "passwordReset";
    expiresAt: Date;
}

const TokenSchema = new Schema<IToken>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true, index: true },
    type: { type: String, enum: ["refresh", "emailVerify", "passwordReset"], required: true },
    expiresAt: { type: Date, required: true, index: true }
}, { timestamps: true })

// TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IToken>("Token", TokenSchema)