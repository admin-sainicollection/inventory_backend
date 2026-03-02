import mongoose, { Schema } from "mongoose";
import { IInvoiceHistory } from "../types";

export const invoiceHistorySchema = new Schema<IInvoiceHistory>({
    invoiceId: {
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
      enum: ['CREATE', 'UPDATE', 'STATUS_CHANGE', 'PAYMENT_RECEIVED', 'EMAIL_SENT', 'PRINTED', 'CANCELLED'],
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
  invoiceHistorySchema.index({ invoiceId: 1, changedAt: -1 });
  invoiceHistorySchema.index({ action: 1 });

  export const InvoiceHistory = mongoose.model<IInvoiceHistory>('InvoiceHistory', invoiceHistorySchema);