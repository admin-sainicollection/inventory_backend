import { Request, Response } from "express";
import { getInvoiceHistory } from "./invoiceHistory.service";
export const getInvoiceHistoryController = async (req: Request, res: Response) => {
    try {
        const { invoiceId } = req.params;
        const history = await getInvoiceHistory(invoiceId as string);
        
        res.status(200).json({
            success: true,
            data: history
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};