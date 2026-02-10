import { Router } from "express";
import { protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { paymentInSchema, updatePaymentIn } from "./paymentIn.validation";
import { createPaymentInController, deletePaymentInController, getAllPaymentInController, getNextPaymentInNumberController, getPaymentInByIdController, updatePaymentInController } from "./paymentIn.controller";

const router = Router();

router.post("/paymentIn/create-payment-in", protect, validate(paymentInSchema), restrictToRoles("admin"), createPaymentInController)

router.get("/paymentIn/get-all-payment-ins", protect, restrictToRoles("admin"), getAllPaymentInController)

router.get("/paymentIn/get-single-payment-in/:id", protect, restrictToRoles("admin"), getPaymentInByIdController)

router.put("/paymentIn/update-payment-in/:id", protect, validate(updatePaymentIn), restrictToRoles("admin"), updatePaymentInController)

router.delete("/paymentIn/delete-payment-in/:id", protect, restrictToRoles("admin"), deletePaymentInController)

router.get("/paymentIn/get-next-payment-in-number", protect, restrictToRoles('admin'), getNextPaymentInNumberController)


export default router;