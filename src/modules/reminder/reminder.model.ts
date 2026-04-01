import mongoose, { Schema } from "mongoose";
import { IReminder } from "./types";

const reminderSchema = new Schema<IReminder>({
    date: {
        type: Date,
        required: true
    },
    reminderDate: {
        type: Date,
        required: true
    },
    nextReminderDate: {
        type: Date
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH']
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['PENDING', 'CLOSED']
    },
    statusNote: {
        type: String
    }
},{
    timestamps:true
})

export const Reminder = mongoose.model<IReminder>('Reminder', reminderSchema)