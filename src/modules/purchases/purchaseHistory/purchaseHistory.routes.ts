import { Router } from "express";
import { authorizePermission, protect } from "../../../middlewares/auth.middleware";
import { getPurchaseHistoryController } from "./purchaseHistory.controller";

const router = Router();

router.get("/purchase/purchase-history/:purchaseId", protect,  authorizePermission('purchase-invoice:history'), getPurchaseHistoryController)

export default router;