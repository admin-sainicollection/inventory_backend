import { Router } from "express";
import { authorizePermission, protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { createSalesInvoiceController, deleteSalesInvoiceController, getAllInvoiceController, getNextInvoiceNumberController, getSalesInvoiceByIdController, updateSalesInvoiceController } from "./salesInvoice.controller";
import { InvoiceSchema, updateInvoiceSchema } from "./salesInvoice.validation";

const router = Router();

router.post("/invoice/create-sales-invoice", protect, validate(InvoiceSchema), authorizePermission('sales-invoice:create'), createSalesInvoiceController)

router.get("/invoice/get-all-sales-invoices", protect, authorizePermission('sales-invoice:list'), getAllInvoiceController)

router.get("/invoice/get-single-sales-invoice/:id", protect, authorizePermission('sales-invoice:read'), getSalesInvoiceByIdController)

router.put("/invoice/update-sales-invoice/:id", protect, validate(updateInvoiceSchema), authorizePermission('sales-invoice:update'), updateSalesInvoiceController)

router.delete("/invoice/delete-sales-invoice/:id", protect, restrictToRoles("admin"), deleteSalesInvoiceController)

router.get("/invoice/get-next-invoice-number", protect, authorizePermission('sales-invoice:read'), getNextInvoiceNumberController)


export default router;