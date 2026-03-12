import mongoose, { Schema } from "mongoose";
import { IPurchaseReturn, additionalChargeSchema, discountSchema, productItemSchema, taxBreakdownSchema } from "../types";

// Main Invoice Schema
const purchaseReturnNonGstSchema = new Schema<IPurchaseReturn>({
    purchaseReturnType: {
        type: String,
        enum: ['PURCHASE', 'PURCHASE_RETURN', 'DEBIT_NOTE', 'PAYMENT_OUT'],
        default: 'PURCHASE_RETURN',
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
        ref: 'InvoiceGst',
        validate: {
            validator: function (v) {
                return v === null || mongoose.Types.ObjectId.isValid(v);
            },
            message: 'Invalid invoice reference'
        },
        required: false
    },
    purchaseReturnNumber: {
        type: String,
        unique: true,
        trim: true,
        sparse: true // Allows multiple null values but unique for non-null
    },
    purchaseReturnDate: {
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
        enum: ['PAID', 'UNPAID', 'PARTIAL_PAID', 'OVERPAID'],
        default: 'UNPAID',
        required: true
    },
    taxBreakdown: [taxBreakdownSchema]
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false // Disable __v field
});

// Indexes for better query performance
// purchaseReturnNonGstSchema.index({ purchaseReturnNumber: 1 });
purchaseReturnNonGstSchema.index({ party: 1 });
purchaseReturnNonGstSchema.index({ purchaseReturnDate: 1 });
purchaseReturnNonGstSchema.index({ createdAt: 1 });
purchaseReturnNonGstSchema.index({ purchaseReturnType: 1, gstType: 1 });

// Virtual for formatted dates (optional)
purchaseReturnNonGstSchema.virtual('formattedPurchaseReturnDate').get(function () {
    return this.purchaseReturnDate ? new Date(this.purchaseReturnDate).toLocaleDateString() : '';
});

purchaseReturnNonGstSchema.virtual('formattedDueDate').get(function () {
    return this.dueDate ? new Date(this.dueDate).toLocaleDateString() : '';
});

// Virtual for payment status
purchaseReturnNonGstSchema.virtual('paymentStatus').get(function () {
    if (!this.receivedAmount) return 'PENDING';
    if (this.receivedAmount >= (this.totalAmount || 0)) return 'PAID';
    if (this.receivedAmount > 0) return 'PARTIAL';
    return 'PENDING';
});

// Pre-save middleware to calculate balance
purchaseReturnNonGstSchema.pre('save', function (next) {
    if (this.totalAmount !== undefined && this.receivedAmount !== undefined) {
        this.balanceAmount = Math.max(0, (this.totalAmount || 0) - (this.receivedAmount || 0));
    }
    next();
});

const PurchaseReturnNonGst = mongoose.model<IPurchaseReturn>('PurchaseReturnNonGst', purchaseReturnNonGstSchema);

export default PurchaseReturnNonGst;