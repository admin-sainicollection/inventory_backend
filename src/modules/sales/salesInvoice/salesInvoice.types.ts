
export type DocumentType = 'INVOICE' | 'QUOTATION' | 'SALES_RETURN' | 'CREDIT_NOTE' | 'DEBIT_NOTE' | 'PURCHASE_ORDER';
export type GstType = 'GST' | 'NON-GST';
export interface ProductItem {
    id: string;
    srNo: number;
    itemName: string;
    hsnNo: string;
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

export type Status = 'PAID' | 'UNPAID' | 'PARTIAL_PAID'

export interface IInvoice extends Document {
    invoiceType: DocumentType;
    gstType: GstType;
    party?: string;
    // partyBillAddress?: string;
    // partyName?: string;
    invoiceNumber?: string;
    invoiceDate?: string | Date;
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
    status?:Status;
    receivedAmount?: number;
    balanceAmount?: number;
    taxBreakdown?: TaxBreakdownItem[];

    createdAt?: Date;
    updatedAt?: Date;
}

// Update your types file
export interface FilterOptions {
  gstType?: string;
  search?: string;
  status?: string;
  dateRange?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  page?: number;
  limit?: number;
}

// ======================================================= Invoice COunter
export interface IInvoiceCounter {
    key?:string,
    seq?:number
}