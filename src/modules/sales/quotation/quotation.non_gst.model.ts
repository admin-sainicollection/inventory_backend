import mongoose, { Schema } from "mongoose";
import { IQuotation, additionalChargeSchema, discountSchema, productItemSchema, taxBreakdownSchema } from "../types";

// Main Invoice Schema
const quotationNonGstSchema = new Schema<IQuotation>({
    quotationType: {
        type: String,
        enum: ['INVOICE', 'QUOTATION', 'SALES_RETURN', 'CREDIT_NOTE', 'DEBIT_NOTE', 'PURCHASE_ORDER'],
        default: 'QUOTATION',
        required: true
    },
    gstType: {
        type: String,
        enum: ['GST', 'NON-GST'],
        default: 'NON-GST',
        required: true
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
    quotationNumber: {
        type: String,
        unique: true,
        trim: true,
        sparse: true // Allows multiple null values but unique for non-null
    },
    quotationDate: {
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
    status: {
        type: String,
        enum: ['OPEN', 'CLOSED', 'EXPIRED', 'CONVERTED'],
        default: 'OPEN',
        required: true
    },
    isConverted: {
        type: Boolean,
        default: false
    },
    convertedAt: {
        type: Date
    },
    convertedToInvoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InvoiceNonGst'
    },
    isClosed: {
        type: Boolean,
        default: false
    },
    taxBreakdown: [taxBreakdownSchema]
}, {
    timestamps: true,
    versionKey: false
});

// Indexes for better query performance
// quotationNonGstSchema.index({ quotationNumber: 1 });
quotationNonGstSchema.index({ party: 1 });
quotationNonGstSchema.index({ quotationDate: 1 });
quotationNonGstSchema.index({ createdAt: 1 });
quotationNonGstSchema.index({ quotationType: 1, gstType: 1 });

// Virtual for formatted dates (optional)
quotationNonGstSchema.virtual('formattedQuotationDate').get(function () {
    return this.quotationDate ? new Date(this.quotationDate).toLocaleDateString() : '';
});

quotationNonGstSchema.virtual('formattedDueDate').get(function () {
    return this.dueDate ? new Date(this.dueDate).toLocaleDateString() : '';
});

// Pre-save middleware to calculate balance
quotationNonGstSchema.pre('save', function (next) {
    if (this.totalAmount !== undefined && this.receivedAmount !== undefined) {
        this.balanceAmount = Math.max(0, (this.totalAmount || 0) - (this.receivedAmount || 0));
    }
    next();
});

const QuotationNonGst = mongoose.model<IQuotation>('QuotationNonGst', quotationNonGstSchema);

export default QuotationNonGst;