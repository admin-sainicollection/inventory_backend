import mongoose, { Document, Schema } from "mongoose";
import { AdditionalCharge, Discount, IInvoice, ProductItem, TaxBreakdownItem } from "./salesInvoice.types";

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

// Pre-save middleware to generate invoice number if not provided
invoiceNonGstSchema.pre('save', async function (next) {
    if (!this.invoiceNumber) {
        // Generate invoice number logic
        const prefix = this.invoiceType === 'QUOTATION' ? 'QUO' :
            this.invoiceType === 'CREDIT_NOTE' ? 'CN' :
                this.invoiceType === 'DEBIT_NOTE' ? 'DN' : 'INV';

        const lastInvoice = await mongoose.model('InvoiceGst').findOne(
            { invoiceNumber: new RegExp(`^${prefix}-`) },
            { invoiceNumber: 1 },
            { sort: { createdAt: -1 } }
        );

        let nextNumber = 1;
        if (lastInvoice && lastInvoice.invoiceNumber) {
            const match = lastInvoice.invoiceNumber.match(/\d+$/);
            if (match) {
                nextNumber = parseInt(match[0]) + 1;
            }
        }

        this.invoiceNumber = `${prefix}-${nextNumber.toString().padStart(4, '0')}`;
    }

    // Ensure dueDate is set based on paymentTerms if not provided
    if (!this.dueDate && this.invoiceDate && this.paymentTerms) {
        const days = parseInt(this.paymentTerms.replace(/\D/g, '')) || 0;
        const dueDate = new Date(this.invoiceDate);
        dueDate.setDate(dueDate.getDate() + days);
        this.dueDate = dueDate;
    }

    next();
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