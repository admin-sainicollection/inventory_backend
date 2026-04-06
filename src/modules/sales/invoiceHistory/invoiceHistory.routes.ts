import { Router } from "express";
import { authorizePermission, protect } from "../../../middlewares/auth.middleware";
import { getInvoiceHistoryController } from "./invoiceHistory.controller";

const router = Router();

router.get("/invoice/invoice-history/:invoiceId", protect, authorizePermission('sales-invoice:history'), getInvoiceHistoryController)

export default router;