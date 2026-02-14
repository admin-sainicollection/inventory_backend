import mongoose, { Schema } from "mongoose";
import { discountSchema, IPaymentIn } from "../types";

// Main Invoice Schema
const paymentInNonGstSchema = new Schema<IPaymentIn>({
    paymentInType: {
        type: String,
        enum: ['INVOICE', 'QUOTATION', 'SALES_RETURN', 'CREDIT_NOTE', 'DEBIT_NOTE', 'PURCHASE_ORDER', 'PAYMENT_IN'],
        default: 'PAYMENT_IN',
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
        enum: ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER'],
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
    paymentInNumber: {
        type: String,
        unique: true,
        trim: true,
        sparse: true
    },
    paymentInDate: {
        type: Date,
        default: Date.now
    },
    date: {
        type: Date,
    },
    discount: discountSchema,
    notes: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    receivedAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    settledAmount: {
        type: Number,
        default: 0,
        min: 0
    },
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false // Disable __v field
});

// Indexes for better query performance
// paymentInNonGstSchema.index({ paymentInNumber: 1 });
paymentInNonGstSchema.index({ party: 1 });
paymentInNonGstSchema.index({ paymentInDate: 1 });
paymentInNonGstSchema.index({ createdAt: 1 });
paymentInNonGstSchema.index({ paymentInType: 1, gstType: 1 });

// Virtual for formatted dates (optional)
paymentInNonGstSchema.virtual('formattedPaymentInDate').get(function () {
    return this.paymentInDate ? new Date(this.paymentInDate).toLocaleDateString() : '';
});

paymentInNonGstSchema.virtual('formattedDueDate').get(function () {
    return this.dueDate ? new Date(this.dueDate).toLocaleDateString() : '';
});

// Virtual for payment status
paymentInNonGstSchema.virtual('paymentStatus').get(function () {
    if (!this.receivedAmount) return 'PENDING';
    if (this.receivedAmount >= (this.totalAmount || 0)) return 'PAID';
    if (this.receivedAmount > 0) return 'PARTIAL';
    return 'PENDING';
});

// Pre-save middleware to calculate balance
paymentInNonGstSchema.pre('save', function (next) {
    if (this.totalAmount !== undefined && this.receivedAmount !== undefined) {
        this.balanceAmount = Math.max(0, (this.totalAmount || 0) - (this.receivedAmount || 0));
    }
    next();
});

const PaymentInNonGst = mongoose.model<IPaymentIn>('PaymentInNonGst', paymentInNonGstSchema);

export default PaymentInNonGst;