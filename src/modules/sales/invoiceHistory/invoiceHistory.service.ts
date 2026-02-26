import { InvoiceHistory } from "./invoiceHistory.model";

export const getInvoiceHistory = async (invoiceId: string) => {
    try {
        const history = await InvoiceHistory.find({ invoiceId })
            .sort({ changedAt: -1 })
            .lean();
        return history;
    } catch (error: any) {
        throw new Error(error.message);
    }
};