import { Router } from "express";
import { protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { QuotationSchema } from "./quotation.validation";
import { createQuotationController, deleteQuotationController, getAllQuotationController, getNextQuotationNumberController } from "./quotation.controller";

const router = Router();

router.post("/quotation/create-quotation", protect, validate(QuotationSchema), restrictToRoles("admin"), createQuotationController)

router.get("/quotation/get-all-quotations", protect, restrictToRoles("admin"), getAllQuotationController)

router.delete("/quotation/delete-quotation/:id", protect, restrictToRoles("admin"), deleteQuotationController)

router.get("/quotation/get-next-quotation-number", protect, restrictToRoles('admin'), getNextQuotationNumberController)

export default router;