import { Schema } from "mongoose";

export type PaymentType = 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER';
export type DocumentType = 'PURCHASE' | 'PURCHASE_RETURN' | 'DEBIT_NOTE'  |  'PAYMENT_OUT';
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

export type PurchaseStatus = 'PAID' | 'UNPAID' | 'PARTIAL_PAID' | 'OVERPAID';
// export type QuotationStatus = 'OPEN' | 'CLOSED' | 'EXPIRED' | 'CONVERTED';
export interface PaymentReference {
    paymentOutId: string;
    amount: number;
}

export interface CommonDocument {
    gstType: GstType;
    party?: string;
    vendor?:string;
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
export interface IPurchase extends CommonDocument {
    purchaseType: DocumentType;
    purchaseNumber?: string;
    purchaseDate?: string | Date;
    status?: PurchaseStatus;
    paymentType?: PaymentType;
    convertedFromQuotationId?: string;
    paymentReferences?: PaymentReference[];
}

//----------------------------------------------------- For Quotation
// export interface IQuotation extends CommonDocument {
//     quotationType: DocumentType;
//     quotationNumber?: string;
//     quotationDate?: string | Date;
//     status?: QuotationStatus;
//     isClosed?: boolean;
//     isConverted?: boolean;
//     convertedAt?: Date;
//     convertedTopurchaseId?: string;
// }

// ---------------------------------------------------- For Debit Note
export interface IDebitNote extends CommonDocument {
    debitNoteType: DocumentType;
    debitNoteNumber?: string;
    debitNoteDate?: string | Date;
    status?: PurchaseStatus;
    purchaseId?: string;
    paymentType?: PaymentType;
}

export interface IPurchaseReturn extends CommonDocument {
    purchaseReturnType: DocumentType;
    purchaseReturnNumber?: string;
    purchaseReturnDate?: string | Date;
    status?: PurchaseStatus;
    purchaseId?: string;
    paymentType?: PaymentType;
}

export interface IPaymentOut extends CommonDocument {
    paymentOutType: DocumentType;
    paymentOutNumber?: string;
    paymentOutDate?: string | Date;
    purchaseId?: string;
    paymentType?: PaymentType;
    settledAmount?: number;
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
    vendorId?: string;
}

// ======================================================= Invoice Counter
export interface IPurchaseCounter {
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

export const paymentReferenceSchema = new Schema<PaymentReference>({
    paymentOutId: {
        type: String,
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    }
}, { _id: true });

// ======================================================================================== invoice History
export type HistoryAction = 'CREATE' | 'UPDATE' | 'STATUS_CHANGE' | 'PAYMENT_RECEIVED' | 'EMAIL_SENT' | 'PRINTED' | 'CANCELLED';
export type ChangedField = {
    field: string;
    oldValue: any;
    newValue: any;
};

export interface IPurchaseHistory {
    purchaseId: string; // Reference to the invoice (can be GST or NON-GST)
    gstType: 'GST' | 'NON-GST';
    action: HistoryAction;
    changedBy?: string; // User ID if you have user management
    changedAt: Date;
    changes: ChangedField[];
    notes?: string;
    previousStatus?: string;
    newStatus?: string;
    previousAmount?: number;
    newAmount?: number;
    metadata?: Record<string, any>;
}