import { Router } from "express";
import { protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { getInvoiceHistoryController } from "./invoiceHistory.controller";

const router = Router();

router.get("/invoice/invoice-history/:invoiceId", protect, restrictToRoles("admin"), getInvoiceHistoryController)

export default router;