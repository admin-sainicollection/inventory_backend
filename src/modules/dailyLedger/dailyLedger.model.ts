import mongoose, { Document, Schema } from "mongoose";

export type SourceType =
    | "MANUAL"
    | "SALES_INVOICE"
    | "PURCHASE_INVOICE"
    | "PAYMENT"
    | "SALES_RETURN"
    | "PURCHASE_RETURN"
    | "OPENING_BALANCE";


export interface IDailyLedger extends Document {
    partyId: string,
    date?: string | Date,
    voucher?: string,
    sourceType: SourceType;
    sourceId?: string;
    srNo?: string,
    withGST?: boolean;
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
        sourceType: {
            type: String,
            enum: [
                "MANUAL",
                "SALES_INVOICE",
                "PURCHASE_INVOICE",
                "PAYMENT",
                "SALES_RETURN",
                "PURCHASE_RETURN",
                "OPENING_BALANCE"
            ],
            required: true,
            default: "MANUAL",
            index: true
        },

        sourceId: {
            type: String,
            required: false,
            index: true
        },
        withGST: {
            type: Boolean,
            trim: true,
            default: false
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
// dailyLedgerSchema.index({ tdsDeductBySelf: 1 });
dailyLedgerSchema.index({ status: 1 });
dailyLedgerSchema.index({ partyId: 1, date: 1 });
dailyLedgerSchema.index({ sourceType: 1 });
dailyLedgerSchema.index({ sourceId: 1 });
dailyLedgerSchema.index({ withGST: 1 });
dailyLedgerSchema.index({ status: 1 });


export default mongoose.model<IDailyLedger>('DailyLedger', dailyLedgerSchema);