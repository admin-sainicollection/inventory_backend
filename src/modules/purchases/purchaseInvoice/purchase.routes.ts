import { Router } from "express";
import { authorizePermission, protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { PurchaseSchema, updatePurchaseSchema } from "./purchaseInvoice.validation";
import { createPurchaseInvoiceController, deletePurchaseInvoiceController, getAllPurchaseController, getNextPurchaseNumberController, getPurchaseInvoiceByIdController, updatePurchaseInvoiceController } from "./purchase.controller";

const router = Router();

router.post("/purchase/create-purchase-invoice", protect, validate(PurchaseSchema), authorizePermission('purchase-invoice:create'), createPurchaseInvoiceController)

router.get("/purchase/get-all-purchase-invoices", protect,authorizePermission('purchase-invoice:list'), getAllPurchaseController)

router.get("/purchase/get-single-purchase-invoice/:id", protect, authorizePermission('purchase-invoice:read'), getPurchaseInvoiceByIdController)

router.put("/purchase/update-purchase-invoice/:id", protect, validate(updatePurchaseSchema), authorizePermission('purchase-invoice:update'), updatePurchaseInvoiceController)

router.delete("/purchase/delete-purchase-invoice/:id", protect, restrictToRoles("admin"), deletePurchaseInvoiceController)

router.get("/purchase/get-next-purchase-number", protect,authorizePermission('purchase-invoice:read'),  getNextPurchaseNumberController)


export default router;