import { PurchaseHistory } from "./purchaseHistory.model";

export const getPurchaseHistory = async (purchaseId: string) => {
    try {
        const history = await PurchaseHistory.find({ purchaseId })
            .sort({ changedAt: -1 })
            .lean();
        return history;
    } catch (error: any) {
        throw new Error(error.message);
    }
};