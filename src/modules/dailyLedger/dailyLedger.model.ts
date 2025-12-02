import mongoose, { Document, Schema } from "mongoose";

export interface IDailyLedger extends Document {
    partyId: string,
    date?: string | Date,
    voucher?: string,
    srNo?: string,
    credit?: number,
    debit?: number,
    description?: string,
    // tdsDeductBySelf?: number,
    status?: "active" | "inactive",
    createdAt: Date,
    updatedAt: Date
}

export const dailyLedgerSchema = new Schema<IDailyLedger>(
    {
        partyId: {
            type: String,
            required: true,
            trim: true
        },
        date: {
            type: String,
            required: false,
            trim: true
        },
        voucher: {
            type: String,
            required: false,
            trim: true
        },
        srNo: {
            type: String,
            required: false,
            trim: true
        },
        credit: {
            type: Number,
            required: false,
            trim: true
        },
        debit: {
            type: Number,
            required: false,
            trim: true
        },
        description: {
            type: String,
            required: false,
            trim: true
        },
        // tdsDeductBySelf: {
        //     type: Number,
        //     required: false,
        //     trim: true
        // },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        },
    },
    {
        timestamps: true
    }
)

dailyLedgerSchema.index({ date: 1 });
dailyLedgerSchema.index({ voucher: 1 });
dailyLedgerSchema.index({ srNo: 1 });
dailyLedgerSchema.index({ credit: 1 });
dailyLedgerSchema.index({ debit: 1 });
dailyLedgerSchema.index({ description: 1 });
// dailyLedgerSchema.index({ tdsDeductBySelf: 1 });
dailyLedgerSchema.index({ status: 1 });

export default mongoose.model<IDailyLedger>('DailyLedger', dailyLedgerSchema);