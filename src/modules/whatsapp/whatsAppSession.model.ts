import mongoose, { Schema } from "mongoose";
import { IWhatsAppSession } from "./types";

const whatsappSessionSchema = new Schema<IWhatsAppSession>({
    phone: { type: String, required: true, index: true },
    isActive: { type: Boolean, default: false },
    startedAt: { type: Date },
    lastMessageAt: { type: Date }
}, { timestamps: true });

export const WhatsAppSession = mongoose.model<IWhatsAppSession>(
    "WhatsAppSession",
    whatsappSessionSchema
);