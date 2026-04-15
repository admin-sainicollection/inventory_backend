import mongoose from "mongoose";

export interface IWhatsAppSession extends Document {
    phone: string,
    isActive: boolean,
    startedAt?: Date,
    lastMessageAt?: Date;
}

export interface IWhatsAppMessage extends Document {
    phone: string;
    message: string;
    direction: "IN" | "OUT";
    timestamp: Date;
    sessionId?: mongoose.Types.ObjectId;
  }
  