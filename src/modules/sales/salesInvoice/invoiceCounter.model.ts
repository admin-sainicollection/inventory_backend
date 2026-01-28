import { IInvoiceCounter } from "./salesInvoice.types";
import mongoose, { Schema } from "mongoose";

export const invoiceCounterSchema = new Schema<IInvoiceCounter>({
    key: {
        type: String,
        required: true,
        unique: true
    },
    seq: {
        type: Number,
        default: 0
    }
})

export default mongoose.model<IInvoiceCounter>('InvoiceCounter', invoiceCounterSchema)