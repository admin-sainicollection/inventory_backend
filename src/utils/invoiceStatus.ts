import { InvoiceStatus } from "../modules/sales/types";


export const getInvoiceStatus = (
    receivedAmount?: number,
    totalAmount?: number
): InvoiceStatus => {
    const received = receivedAmount ?? 0;
    const total = totalAmount ?? 0;

    if (received <= 0) return 'UNPAID';
    if (received < total) return 'PARTIAL_PAID';
    if (received === total) return 'PAID';
    return 'OVERPAID';
};
