import mongoose, {  Schema } from "mongoose";
import { IInvoice, additionalChargeSchema, discountSchema, productItemSchema, taxBreakdownSchema } from "../types";

// Main Invoice Schema
const invoiceNonGstSchema = new Schema<IInvoice>({
    invoiceType: {
        type: String,
        enum: ['INVOICE', 'QUOTATION', 'SALES_RETURN', 'CREDIT_NOTE', 'DEBIT_NOTE', 'PURCHASE_ORDER'],
        default: 'INVOICE',
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
    invoiceNumber: {
        type: String,
        unique: true,
        trim: true,
        sparse: true // Allows multiple null values but unique for non-null
    },
    invoiceDate: {
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
        enum: ['PAID', 'UNPAID', 'PARTIAL_PAID'],
        default: 'UNPAID',
        required: true
    },
    taxBreakdown: [taxBreakdownSchema]
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    versionKey: false // Disable __v field
});

// Indexes for better query performance
invoiceNonGstSchema.index({ invoiceNumber: 1 });
invoiceNonGstSchema.index({ party: 1 });
invoiceNonGstSchema.index({ invoiceDate: 1 });
invoiceNonGstSchema.index({ createdAt: 1 });
invoiceNonGstSchema.index({ invoiceType: 1, gstType: 1 });

// Virtual for formatted dates (optional)
invoiceNonGstSchema.virtual('formattedInvoiceDate').get(function () {
    return this.invoiceDate ? new Date(this.invoiceDate).toLocaleDateString() : '';
});

invoiceNonGstSchema.virtual('formattedDueDate').get(function () {
    return this.dueDate ? new Date(this.dueDate).toLocaleDateString() : '';
});

// Virtual for payment status
invoiceNonGstSchema.virtual('paymentStatus').get(function () {
    if (!this.receivedAmount) return 'PENDING';
    if (this.receivedAmount >= (this.totalAmount || 0)) return 'PAID';
    if (this.receivedAmount > 0) return 'PARTIAL';
    return 'PENDING';
});

// Pre-save middleware to calculate balance
invoiceNonGstSchema.pre('save', function (next) {
    if (this.totalAmount !== undefined && this.receivedAmount !== undefined) {
        this.balanceAmount = Math.max(0, (this.totalAmount || 0) - (this.receivedAmount || 0));
    }
    next();
});

const InvoiceNonGst = mongoose.model<IInvoice>('InvoiceNonGst', invoiceNonGstSchema);

export default InvoiceNonGst;