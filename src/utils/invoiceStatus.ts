import { InvoiceStatus } from "../modules/sales/types";


export const getInvoiceStatus = (
    receivedAmount?: number,
    totalAmount?: number
): InvoiceStatus => {
    const received = receivedAmount ?? 0;
    const total = totalAmount ?? 0;

    if (received === total) return 'PAID';
    else if (received > total) return 'OVERPAID';
    else if(received > 0 && received< total) return 'PARTIAL_PAID';
    else return 'UNPAID';
};
