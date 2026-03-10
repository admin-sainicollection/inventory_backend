import { Router } from "express";
import { protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { PurchaseSchema, updatePurchaseSchema } from "./purchaseInvoice.validation";
import { createPurchaseInvoiceController, deletePurchaseInvoiceController, getAllPurchaseController, getNextPurchaseNumberController, getPurchaseInvoiceByIdController, updatePurchaseInvoiceController } from "./purchase.controller";

const router = Router();

router.post("/purchase/create-purchase-invoice", protect, validate(PurchaseSchema), restrictToRoles("admin"), createPurchaseInvoiceController)

router.get("/purchase/get-all-purchase-invoices", protect, restrictToRoles("admin"), getAllPurchaseController)

router.get("/purchase/get-single-purchase-invoice/:id", protect, restrictToRoles("admin"), getPurchaseInvoiceByIdController)

router.put("/purchase/update-purchase-invoice/:id", protect, validate(updatePurchaseSchema), restrictToRoles("admin"), updatePurchaseInvoiceController)

router.delete("/purchase/delete-purchase-invoice/:id", protect, restrictToRoles("admin"), deletePurchaseInvoiceController)

router.get("/purchase/get-next-purchase-number", protect, restrictToRoles('admin'), getNextPurchaseNumberController)


export default router;