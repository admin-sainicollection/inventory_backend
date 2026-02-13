import mongoose, { Schema } from "mongoose";
import {  ISalesReturn, additionalChargeSchema, discountSchema, productItemSchema, taxBreakdownSchema } from "../types";

// Main Invoice Schema
const salesReturnNonGstSchema = new Schema<ISalesReturn>({
    salesReturnType: {
        type: String,
        enum: ['INVOICE', 'QUOTATION', 'SALES_RETURN', 'CREDIT_NOTE', 'DEBIT_NOTE', 'PURCHASE_ORDER'],
        default: 'SALES_RETURN',
        required: true
    },
    gstType: {
        type: String,
        enum: ['GST', 'NON-GST'],
        default: 'NON-GST',
        required: true
    },
    paymentType: {
        type: String,
        enum: ['CASH' , 'UPI' , 'CARD' , 'BANK_TRANSFER'],
        default: 'CASH',
    },
    party: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party',
        validate: {
            validator: function (v) {
                return v === null || mongoose.Types.ObjectId.isValid(v);
            },
            message: 'Invalid party reference'
        }
    },
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InvoiceNonGst',
        validate: {
            validator: function (v) {
                return v === null || mongoose.Types.ObjectId.isValid(v);
            },
            message: 'Invalid invoice reference'
        },
        required: false
    },
    salesReturnNumber: {
        type: String,
        unique: true,
        trim: true,
        sparse: true // Allows multiple null values but unique for non-null
    },
    salesReturnDate: {
        type: Date,
        default: Date.now
    },
    date: {
        type: Date,
    },
    items: [productItemSchema],
    charges: [additionalChargeSchema],
    discount: discountSchema,
    notes: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    terms: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    roundOff: {
        type: Boolean,
        default: false
    },
    totalAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    taxableAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    subtotal: {
        type: Number,
        default: 0,
        min: 0
    },
    receivedAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    balanceAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['PAID', 'UNPAID', 'PARTIAL_PAID','OVERPAID'],
        default: 'UNPAID',
        required: true
    },
    taxBreakdown: [taxBreakdownSchema]
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false // Disable __v field
});

// Indexes for better query performance
salesReturnNonGstSchema.index({ salesReturnNumber: 1 });
salesReturnNonGstSchema.index({ party: 1 });
salesReturnNonGstSchema.index({ salesReturnDate: 1 });
salesReturnNonGstSchema.index({ createdAt: 1 });
salesReturnNonGstSchema.index({ salesReturnType: 1, gstType: 1 });

// Virtual for formatted dates (optional)
salesReturnNonGstSchema.virtual('formattedSalesReturnDate').get(function () {
    return this.salesReturnDate ? new Date(this.salesReturnDate).toLocaleDateString() : '';
});

salesReturnNonGstSchema.virtual('formattedDueDate').get(function () {
    return this.dueDate ? new Date(this.dueDate).toLocaleDateString() : '';
});

// Virtual for payment status
salesReturnNonGstSchema.virtual('paymentStatus').get(function () {
    if (!this.receivedAmount) return 'PENDING';
    if (this.receivedAmount >= (this.totalAmount || 0)) return 'PAID';
    if (this.receivedAmount > 0) return 'PARTIAL';
    return 'PENDING';
});

// Pre-save middleware to calculate balance
salesReturnNonGstSchema.pre('save', function (next) {
    if (this.totalAmount !== undefined && this.receivedAmount !== undefined) {
        this.balanceAmount = Math.max(0, (this.totalAmount || 0) - (this.receivedAmount || 0));
    }
    next();
});

const SalesReturnNonGst = mongoose.model<ISalesReturn>('SalesReturnNonGst', salesReturnNonGstSchema);

export default SalesReturnNonGst;