import { Router } from "express";
import { authorizePermission, protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { QuotationSchema, updateQuotationSchema } from "./quotation.validation";
import { createQuotationController, deleteQuotationController, getAllQuotationController, getNextQuotationNumberController, getQuotationByIdController, setIsClosedStatusController, updateQuotationController } from "./quotation.controller";

const router = Router();

router.post("/quotation/create-quotation", protect, validate(QuotationSchema), authorizePermission('quotation:create'), createQuotationController)

router.get("/quotation/get-all-quotations", protect, authorizePermission('quotation:list'), getAllQuotationController)

router.get("/quotation/get-single-quotation/:id", protect, authorizePermission('quotation:read'), getQuotationByIdController)

router.put("/quotation/update-quotation/:id", protect, validate(updateQuotationSchema), authorizePermission('quotation:update'), updateQuotationController)

router.put("/quotation/update-quotation-close-status/:id", protect, authorizePermission('quotation:update'), setIsClosedStatusController)

router.delete("/quotation/delete-quotation/:id", protect, restrictToRoles("admin"), deleteQuotationController)

router.get("/quotation/get-next-quotation-number", protect, authorizePermission('quotation:red'), getNextQuotationNumberController)

export default router;