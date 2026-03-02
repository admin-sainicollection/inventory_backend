import { IInvoice, InvoiceStatus } from "../modules/sales/types";

export const calculateInvoiceTotals = (invoice: IInvoice, paymentReceivedAmount: number, data?:any): { 
    receivedAmount: number; 
    balanceAmount: number; 
    status: InvoiceStatus;
} => {
    // Calculate total received from payment references
    const totalReferenceAmount =(invoice.paymentReferences || []).reduce(
        (sum, ref) => sum + (ref.amount || 0), 
        0
    )
    const totalReceived = totalReferenceAmount + (invoice.receivedAmount || 0) + paymentReceivedAmount;
    
    const totalAmount = invoice.totalAmount || 0;
    const balanceAmount = Math.max(0, totalAmount - totalReceived);
    
    let status: InvoiceStatus;
    
    if (totalReceived >= totalAmount && totalAmount > 0) {
        status = totalReceived > totalAmount ? 'OVERPAID' : 'PAID';
    } else if (totalReceived > 0) {
        status = 'PARTIAL_PAID';
    } else {
        status = 'UNPAID';
    }
    
    return {
        receivedAmount: totalReceived,
        balanceAmount,
        status
    };
};