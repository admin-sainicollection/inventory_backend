import mongoose, { Schema } from "mongoose";
import { discountSchema, IPaymentOut } from "../types";

// Main Invoice Schema
const paymentOutGstSchema = new Schema<IPaymentOut>({
    paymentOutType: {
        type: String,
        enum: ['PURCHASE', 'PURCHASE_RETURN', 'DEBIT_NOTE', 'PAYMENT_OUT'],
        default: 'PAYMENT_OUT',
        required: true
    },
    gstType: {
        type: String,
        enum: ['GST', 'NON-GST'],
        default: 'GST',
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
        ref: 'PurchaseGst',
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
// paymentOutGstSchema.index({ paymentOutNumber: 1 });
paymentOutGstSchema.index({ party: 1 });
paymentOutGstSchema.index({ paymentOutDate: 1 });
paymentOutGstSchema.index({ createdAt: 1 });
paymentOutGstSchema.index({ paymentOutType: 1, gstType: 1 });

// Virtual for formatted dates (optional)
paymentOutGstSchema.virtual('formattedPaymentOutDate').get(function () {
    return this.paymentOutDate ? new Date(this.paymentOutDate).toLocaleDateString() : '';
});

paymentOutGstSchema.virtual('formattedDueDate').get(function () {
    return this.dueDate ? new Date(this.dueDate).toLocaleDateString() : '';
});

// Virtual for payment status
paymentOutGstSchema.virtual('paymentStatus').get(function () {
    if (!this.receivedAmount) return 'PENDING';
    if (this.receivedAmount >= (this.totalAmount || 0)) return 'PAID';
    if (this.receivedAmount > 0) return 'PARTIAL';
    return 'PENDING';
});

// Pre-save middleware to calculate balance
paymentOutGstSchema.pre('save', function (next) {
    if (this.totalAmount !== undefined && this.receivedAmount !== undefined) {
        this.balanceAmount = Math.max(0, (this.totalAmount || 0) - (this.receivedAmount || 0));
    }
    next();
});

const PaymentOutGst = mongoose.model<IPaymentOut>('PaymentOutGst', paymentOutGstSchema);

export default PaymentOutGst;