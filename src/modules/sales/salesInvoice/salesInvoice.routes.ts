import { Router } from "express";
import { protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { createSalesInvoiceController, deleteSalesInvoiceController, getAllInvoiceController, getNextInvoiceNumberController, getSalesInvoiceByIdController, updateSalesInvoiceController } from "./salesInvoice.controller";
import { InvoiceSchema, updateInvoiceSchema } from "./salesInvoice.validation";

const router = Router();

router.post("/invoice/create-sales-invoice", protect, validate(InvoiceSchema), restrictToRoles("admin"), createSalesInvoiceController)

router.get("/invoice/get-all-sales-invoices", protect, restrictToRoles("admin"), getAllInvoiceController)

router.get("/invoice/get-single-sales-invoice/:id", protect, restrictToRoles("admin"), getSalesInvoiceByIdController)

router.put("/invoice/update-sales-invoice/:id", protect, validate(updateInvoiceSchema), restrictToRoles("admin"), updateSalesInvoiceController)

router.delete("/invoice/delete-sales-invoice/:id", protect, restrictToRoles("admin"), deleteSalesInvoiceController)

router.get("/invoice/get-next-invoice-number", protect, restrictToRoles('admin'), getNextInvoiceNumberController)


export default router;