import mongoose, { Schema } from "mongoose";
import { IWhatsAppMessage } from "./types";

const whatsappMessageSchema = new Schema<IWhatsAppMessage>({
    phone: { type: String, required: true, index: true },
    message: { type: String, required: true },
    direction: { type: String, enum: ["IN", "OUT"], required: true },
    timestamp: { type: Date, default: Date.now },
    sessionId: { type: Schema.Types.ObjectId, ref: "WhatsAppSession" }
});

export const WhatsAppMessage = mongoose.model<IWhatsAppMessage>(
    "WhatsAppMessage",
    whatsappMessageSchema
);