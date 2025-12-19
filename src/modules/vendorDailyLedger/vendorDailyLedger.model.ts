import mongoose, { Document, Schema } from "mongoose";

export interface IVendorDailyLedger extends Document {
    vendorId: string,
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

export const vendorDailyLedgerSchema = new Schema<IVendorDailyLedger>(
    {
        vendorId: {
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

vendorDailyLedgerSchema.index({ date: 1 });
vendorDailyLedgerSchema.index({ voucher: 1 });
vendorDailyLedgerSchema.index({ srNo: 1 });
vendorDailyLedgerSchema.index({ credit: 1 });
vendorDailyLedgerSchema.index({ debit: 1 });
vendorDailyLedgerSchema.index({ description: 1 });
// vendorDailyLedgerSchema.index({ tdsDeductBySelf: 1 });
vendorDailyLedgerSchema.index({ status: 1 });

export default mongoose.model<IVendorDailyLedger>('VendorDailyLedger', vendorDailyLedgerSchema);