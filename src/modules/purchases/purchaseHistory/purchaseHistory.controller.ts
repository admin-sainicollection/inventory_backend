import { Request, Response } from "express";
import { getPurchaseHistory } from "./purchaseHistory.service";
export const getPurchaseHistoryController = async (req: Request, res: Response) => {
    try {
        const { purchaseId } = req.params;
        const history = await getPurchaseHistory(purchaseId as string);
        
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