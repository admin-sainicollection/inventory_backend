import { Router } from "express";
import { protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { QuotationSchema, updateQuotationSchema } from "./quotation.validation";
import { createQuotationController, deleteQuotationController, getAllQuotationController, getNextQuotationNumberController, getQuotationByIdController, setIsClosedStatusController, updateQuotationController } from "./quotation.controller";

const router = Router();

router.post("/quotation/create-quotation", protect, validate(QuotationSchema), restrictToRoles("admin"), createQuotationController)

router.get("/quotation/get-all-quotations", protect, restrictToRoles("admin"), getAllQuotationController)

router.get("/quotation/get-single-quotation/:id", protect, restrictToRoles("admin"), getQuotationByIdController)

router.put("/quotation/update-quotation/:id", protect, validate(updateQuotationSchema), restrictToRoles("admin"), updateQuotationController)

router.put("/quotation/update-quotation-close-status/:id", protect, restrictToRoles("admin"), setIsClosedStatusController)

router.delete("/quotation/delete-quotation/:id", protect, restrictToRoles("admin"), deleteQuotationController)

router.get("/quotation/get-next-quotation-number", protect, restrictToRoles('admin'), getNextQuotationNumberController)

export default router;