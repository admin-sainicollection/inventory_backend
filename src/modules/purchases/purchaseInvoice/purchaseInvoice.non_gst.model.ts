import mongoose, { Schema } from "mongoose";
import { IPurchase, additionalChargeSchema, discountSchema, paymentReferenceSchema, productItemSchema, taxBreakdownSchema } from "../types";

// Main Invoice Schema
const purchaseNonGstSchema = new Schema<IPurchase>({
    purchaseType: {
        type: String,
        enum: ['PURCHASE', 'PURCHASE_RETURN', 'DEBIT_NOTE', 'PAYMENT_OUT'],
        default: 'PURCHASE',
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
        default: null, // Set default to null instead of undefined
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
        default: null, // Set default to null
        validate: {
            validator: function (v: any) {
                // Allow null, undefined, or valid ObjectId
                return v === null || v === undefined || mongoose.Types.ObjectId.isValid(v);
            },
            message: 'Invalid vendor reference'
        }
    },
    purchaseNumber: {
        type: String,
        unique: true,
        trim: true,
        sparse: true // Allows multiple null values but unique for non-null
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    date: {
        type: Date,
    },
    dueDate: {
        type: Date
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
    paymentTerms: {
        type: String,
        trim: true
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
    taxBreakdown: [taxBreakdownSchema],
    paymentReferences: [paymentReferenceSchema],
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false // Disable __v field
});

// Indexes for better query performance
// purchaseNonGstSchema.index({ purchaseNumber: 1 });
purchaseNonGstSchema.index({ party: 1 });
purchaseNonGstSchema.index({ purchaseDate: 1 });
purchaseNonGstSchema.index({ createdAt: 1 });
purchaseNonGstSchema.index({ purchaseType: 1, gstType: 1 });

// Virtual for formatted dates (optional)
purchaseNonGstSchema.virtual('formattedPurchaseDate').get(function () {
    return this.purchaseDate ? new Date(this.purchaseDate).toLocaleDateString() : '';
});

purchaseNonGstSchema.virtual('formattedDueDate').get(function () {
    return this.dueDate ? new Date(this.dueDate).toLocaleDateString() : '';
});

// Virtual for payment status
purchaseNonGstSchema.virtual('paymentStatus').get(function () {
    if (!this.receivedAmount) return 'PENDING';
    if (this.receivedAmount >= (this.totalAmount || 0)) return 'PAID';
    if (this.receivedAmount > 0) return 'PARTIAL';
    return 'PENDING';
});

// Pre-save middleware to calculate balance
purchaseNonGstSchema.pre('save', function (next) {
    if (this.totalAmount !== undefined && this.receivedAmount !== undefined) {
        this.balanceAmount = Math.max(0, (this.totalAmount || 0) - (this.receivedAmount || 0));
    }
    next();
});

const PurchaseNonGst = mongoose.model<IPurchase>('PurchaseNonGst', purchaseNonGstSchema);

export default PurchaseNonGst;