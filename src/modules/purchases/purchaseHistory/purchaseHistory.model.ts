import mongoose, { Schema } from "mongoose";
import { IPurchaseHistory } from "../types";

export const purchaseHistorySchema = new Schema<IPurchaseHistory>({
    purchaseId: {
        type: String,
        required: true,
        index: true
    },
    gstType: {
        type: String,
        enum: ['GST', 'NON-GST'],
        required: true
    },
    action: {
        type: String,
        enum: ['CREATE', 'UPDATE', 'STATUS_CHANGE', 'PAYMENT_PAID', 'EMAIL_SENT', 'PRINTED', 'CANCELLED'],
        required: true
    },
    changedBy: {
        type: String,
        default: 'system'
    },
    changedAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    changes: [{
        field: { type: String, required: true },
        oldValue: { type: Schema.Types.Mixed },
        newValue: { type: Schema.Types.Mixed }
    }],
    notes: {
        type: String,
        trim: true
    },
    previousStatus: {
        type: String
    },
    newStatus: {
        type: String
    },
    previousAmount: {
        type: Number
    },
    newAmount: {
        type: Number
    },
    metadata: {
        type: Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Index for better query performance
purchaseHistorySchema.index({ purchaseId: 1, changedAt: -1 });
purchaseHistorySchema.index({ action: 1 });

export const PurchaseHistory = mongoose.model<IPurchaseHistory>('PurchaseHistory', purchaseHistorySchema);