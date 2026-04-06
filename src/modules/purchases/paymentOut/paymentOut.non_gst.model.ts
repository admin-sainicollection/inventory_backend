import mongoose, { Schema } from "mongoose";
import { discountSchema, IPaymentOut } from "../types";

// Main Invoice Schema
const paymentOutNonGstSchema = new Schema<IPaymentOut>({
    paymentOutType: {
        type: String,
        enum: ['PURCHASE', 'PURCHASE_RETURN', 'DEBIT_NOTE', 'PAYMENT_OUT'],
        default: 'PAYMENT_OUT',
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
        required: false,
        default: null,
        validate: {
            validator: function (v: any) {
                // Allow null, undefined, or valid ObjectId
                return v === null || v === undefined || mongoose.Types.ObjectId.isValid(v);
            },
            message: 'Invalid party reference'
        }
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: false,
        default: null,
        validate: {
            validator: function (v: any) {
                // Allow null, undefined, or valid ObjectId
                return v === null || v === undefined || mongoose.Types.ObjectId.isValid(v);
            },
            message: 'Invalid vendor reference'
        }
    },
    purchaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PurchaseNonGst',
        validate: {
            validator: function (v) {
                return v === null || mongoose.Types.ObjectId.isValid(v);
            },
            message: 'Invalid invoice reference'
        },
        required: false
    },
    paymentOutNumber: {
        type: String,
        unique: true,
        trim: true,
        sparse: true
    },
    paymentOutDate: {
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
// paymentOutNonGstSchema.index({ paymentOutNumber: 1 });
paymentOutNonGstSchema.index({ party: 1 });
paymentOutNonGstSchema.index({ paymentOutDate: 1 });
paymentOutNonGstSchema.index({ createdAt: 1 });
paymentOutNonGstSchema.index({ paymentOutType: 1, gstType: 1 });

// Virtual for formatted dates (optional)
paymentOutNonGstSchema.virtual('formattedPaymentOutDate').get(function () {
    return this.paymentOutDate ? new Date(this.paymentOutDate).toLocaleDateString() : '';
});

paymentOutNonGstSchema.virtual('formattedDueDate').get(function () {
    return this.dueDate ? new Date(this.dueDate).toLocaleDateString() : '';
});

// Virtual for payment status
paymentOutNonGstSchema.virtual('paymentStatus').get(function () {
    if (!this.receivedAmount) return 'PENDING';
    if (this.receivedAmount >= (this.totalAmount || 0)) return 'PAID';
    if (this.receivedAmount > 0) return 'PARTIAL';
    return 'PENDING';
});

// Pre-save middleware to calculate balance
paymentOutNonGstSchema.pre('save', function (next) {
    if (this.totalAmount !== undefined && this.receivedAmount !== undefined) {
        this.balanceAmount = Math.max(0, (this.totalAmount || 0) - (this.receivedAmount || 0));
    }
    next();
});

const PaymentOutNonGst = mongoose.model<IPaymentOut>('PaymentOutNonGst', paymentOutNonGstSchema);

export default PaymentOutNonGst;