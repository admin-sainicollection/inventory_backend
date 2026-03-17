import { Router } from "express";
import { protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { getPurchaseHistoryController } from "./purchaseHistory.controller";

const router = Router();

router.get("/purchase/purchase-history/:purchaseId", protect, restrictToRoles("admin"), getPurchaseHistoryController)

export default router;