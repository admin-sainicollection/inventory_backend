import { Schema } from "mongoose";

export type PaymentType = 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
export type DocumentType = 'INVOICE' | 'QUOTATION' | 'SALES_RETURN' | 'CREDIT_NOTE' | 'DEBIT_NOTE' | 'PURCHASE_ORDER' | 'PAYMENT_IN';
export type GstType = 'GST' | 'NON-GST';
export interface ProductItem {
    id: string;
    srNo: number;
    itemName: string;
    hsnNo?: string;
    quantity: number;
    price: number;
    discount: {
        amount: number;
        isPercentage: boolean;
    };
    tax: {
        type: 'none' | 'gst' | 'custom';
        rate: number;
    };
    amount: number;
    productId?: string; // Original product ID from inventory
}
export interface AdditionalCharge {
    id: string;
    label: string;
    amount: number;
}
export interface Discount {
    type: 'before_tax' | 'after_tax';
    amount: number;
    isPercentage: boolean;
}
export interface TaxBreakdownItem {
    sgst: number;
    cgst: number;
    igst: number;
}

export type InvoiceStatus = 'PAID' | 'UNPAID' | 'PARTIAL_PAID' | 'OVERPAID';
export type QuotationStatus = 'OPEN' | 'CLOSED' | 'EXPIRED' | 'CONVERTED';

export interface CommonDocument {
    gstType: GstType;
    party?: string;
    // partyBillAddress?: string;
    // partyName?: string;
    date?: string | Date;
    dueDate?: string | Date;
    items?: ProductItem[];
    charges?: AdditionalCharge[];
    discount?: Discount;
    notes?: string;
    terms?: string;
    paymentTerms?: string;
    roundOff?: boolean;
    totalAmount?: number;
    taxableAmount?: number;
    subtotal?: number;
    receivedAmount?: number;
    balanceAmount?: number;
    taxBreakdown?: TaxBreakdownItem[];

    createdAt?: Date;
    updatedAt?: Date;
}

// ---------------------------------------------------- For Invoice
export interface IInvoice extends CommonDocument {
    invoiceType: DocumentType;
    invoiceNumber?: string;
    invoiceDate?: string | Date;
    status?: InvoiceStatus;
    paymentType?:PaymentType;
    convertedFromQuotationId?:string;
}

//----------------------------------------------------- For Quotation
export interface IQuotation extends CommonDocument {
    quotationType: DocumentType;
    quotationNumber?: string;
    quotationDate?: string | Date;
    status?: QuotationStatus;
    isClosed?:boolean;
    isConverted?:boolean;
    convertedAt?:Date;
    convertedToInvoiceId?:string;
}

// ---------------------------------------------------- For Credit Note
export interface ICreditNote extends CommonDocument {
    creditNoteType: DocumentType;
    creditNoteNumber?: string;
    creditNoteDate?: string | Date;
    status?: InvoiceStatus;
    invoiceId?:string;
    paymentType?:PaymentType;
}

export interface ISalesReturn extends CommonDocument {
    salesReturnType: DocumentType;
    salesReturnNumber?: string;
    salesReturnDate?: string | Date;
    status?: InvoiceStatus;
    invoiceId?:string;
    paymentType?:PaymentType;
}

export interface IPaymentIn extends CommonDocument {
    paymentInType: DocumentType;
    paymentInNumber?: string;
    paymentInDate?: string | Date;
    invoiceId?:string;
    paymentType?:PaymentType;
    settledAmount?:number;
}

export interface FilterOptions {
    gstType?: string;
    search?: string;
    status?: string;
    dateRange?: string;
    startDate?: string | Date;
    endDate?: string | Date;
    page?: number;
    limit?: number;
    partyId?: string;
}

// ======================================================= Invoice Counter
export interface IInvoiceCounter {
    key?: string,
    seq?: number
}

// ============================================================================= COMMON SCHEMAS
// Product Item Schema
export const productItemSchema = new Schema<ProductItem>({
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
}, { _id: false }); 

// Additional Charge Schema
export const additionalChargeSchema = new Schema<AdditionalCharge>({
    id: { type: String, required: true },
    label: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 }
}, { _id: false });

// Discount Schema
export const discountSchema = new Schema<Discount>({
    type: { type: String, enum: ['before_tax', 'after_tax'], default: 'before_tax' },
    amount: { type: Number, default: 0, min: 0 },
    isPercentage: { type: Boolean, default: false }
}, { _id: false });

// Tax Breakdown Schema
export const taxBreakdownSchema = new Schema<TaxBreakdownItem>({
    sgst: { type: Number, default: 0, min: 0, max: 100 },
    cgst: { type: Number, default: 0, min: 0, max: 100 },
    igst: { type: Number, default: 0, min: 0, max: 100 }
}, { _id: false });