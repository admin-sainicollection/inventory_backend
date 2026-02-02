import mongoose, { Schema } from "mongoose";
import { AdditionalCharge, Discount, IQuotation, ProductItem, TaxBreakdownItem } from "../types";

// Product Item Schema
const productItemSchema = new Schema<ProductItem>({
    id: { type: String, required: true },
    srNo: { type: Number, required: true, min: 1 },
    itemName: { type: String, required: true, trim: true },
    hsnNo: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    discount: {
        amount: { type: Number, default: 0, min: 0 },
        isPercentage: { type: Boolean, default: false }
    },
    tax: {
        type: { type: String, enum: ['none', 'gst', 'custom'], default: 'none' },
        rate: { type: Number, default: 0, min: 0, max: 100 }
    },
    amount: { type: Number, required: true, min: 0 },
    productId: { type: String, trim: true }
}, { _id: false }); // No separate _id for subdocument

// Additional Charge Schema
const additionalChargeSchema = new Schema<AdditionalCharge>({
    id: { type: String, required: true },
    label: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 }
}, { _id: false });

// Discount Schema
const discountSchema = new Schema<Discount>({
    type: { type: String, enum: ['before_tax', 'after_tax'], default: 'before_tax' },
    amount: { type: Number, default: 0, min: 0 },
    isPercentage: { type: Boolean, default: false }
}, { _id: false });

// Tax Breakdown Schema
const taxBreakdownSchema = new Schema<TaxBreakdownItem>({
    sgst: { type: Number, default: 0, min: 0, max: 100 },
    cgst: { type: Number, default: 0, min: 0, max: 100 },
    igst: { type: Number, default: 0, min: 0, max: 100 }
}, { _id: false });

// Main Invoice Schema
const quotationGstSchema = new Schema<IQuotation>({
    quotationType: {
        type: String,
        enum: ['INVOICE', 'QUOTATION', 'SALES_RETURN', 'CREDIT_NOTE', 'DEBIT_NOTE', 'PURCHASE_ORDER'],
        default: 'QUOTATION',
        required: true
    },
    gstType: {
        type: String,
        enum: ['GST', 'NON-GST'],
        default: 'GST',
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
        enum: ['OPEN' ,'CLOSED' ,'EXPIRED' ,'CONVERTED'],
        default: 'OPEN',
        required: true
    },
    taxBreakdown: [taxBreakdownSchema]
}, {
    timestamps: true,
    versionKey: false
});

// Indexes for better query performance
quotationGstSchema.index({ quotationNumber: 1 });
quotationGstSchema.index({ party: 1 });
quotationGstSchema.index({ quotationDate: 1 });
quotationGstSchema.index({ createdAt: 1 });
quotationGstSchema.index({ quotationType: 1, gstType: 1 });

// Virtual for formatted dates (optional)
quotationGstSchema.virtual('formattedQuotationDate').get(function () {
    return this.quotationDate ? new Date(this.quotationDate).toLocaleDateString() : '';
});

quotationGstSchema.virtual('formattedDueDate').get(function () {
    return this.dueDate ? new Date(this.dueDate).toLocaleDateString() : '';
});

// Pre-save middleware to calculate balance
quotationGstSchema.pre('save', function (next) {
    if (this.totalAmount !== undefined && this.receivedAmount !== undefined) {
        this.balanceAmount = Math.max(0, (this.totalAmount || 0) - (this.receivedAmount || 0));
    }
    next();
});

const QuotationGst = mongoose.model<IQuotation>('QuotationGst', quotationGstSchema);

export default QuotationGst;