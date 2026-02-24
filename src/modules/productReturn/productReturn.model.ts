import mongoose, { Schema } from "mongoose";
import { IProductReturn, IStatusActivity, IStatusNote, Item } from "./types";

export const RETURN_STATUS = [
    'RETURN_CREATED',
    'RECEIVED_AT_SHOP',
    'SENT_TO_VENDOR',
    'RECEIVED_BY_VENDOR'
  ] as const;

const itemSchema = new Schema<Item>({
    id: {
        type: String
    },
    srNo: {
        type: Number
    },
    itemName: {
        type: String
    },
    aliasName: {
        type: String
    },
    hsnNo: {
        type: String
    },
    quantity: {
        type: Number
    },
    price: {
        type: Number
    },
    amount: {
        type: Number
    },
    productId: {
        type: String
    }
}, { _id: false })

const statusHistorySchema = new Schema<IStatusActivity>({
    from_status: {
        type: String,
        enum: RETURN_STATUS
    },
    to_status: {
        type: String,
        enum: RETURN_STATUS,
        required: true
    },
    note: {
        type: String,
        trim: true
    },
    changed_at: {
        type: Date,
        default: Date.now
    },
    is_initial: {
        type: Boolean,
        default: false
    }
}, { _id: true });

const statusNoteSchema = new Schema<IStatusNote>({
    previous_status: {
        type: String,
        enum: RETURN_STATUS
    },
    current_status: {
        type: String,
        enum: RETURN_STATUS,
    },
    note: {
        type: String,
        required: true,
        trim: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

export const productReturnSchema = new Schema<IProductReturn>({
    productReturnNumber: {
        type: String,
        trim: true
    },
    productReturnDate: {
        type: Date,
        default: Date.now
    },
    items: [itemSchema],
    in_date: {
        type: Date
    },
    out_date: {
        type: Date
    },
    party: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party',
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: RETURN_STATUS,
        default: 'RETURN_CREATED'
    },
    previous_status: {
        type: String,
        enum: RETURN_STATUS
    },
    status_history: [statusHistorySchema],
    status_notes: [statusNoteSchema]
}, { timestamps: true })

export const ProductReturn = mongoose.model<IProductReturn>('ProductReturn', productReturnSchema);