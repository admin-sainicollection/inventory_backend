import { Router } from "express";
import { authorizePermission, protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { paymentInSchema, updatePaymentIn } from "./paymentIn.validation";
import { createPaymentInController, deletePaymentInController, getAllPaymentInController, getNextPaymentInNumberController, getPaymentInByIdController, updatePaymentInController } from "./paymentIn.controller";

const router = Router();

router.post("/paymentIn/create-payment-in", protect, validate(paymentInSchema), authorizePermission('payment-in:create'), createPaymentInController)

router.get("/paymentIn/get-all-payment-ins", protect,  authorizePermission('payment-in:list'), getAllPaymentInController)

router.get("/paymentIn/get-single-payment-in/:id", protect, authorizePermission('payment-in:read'), getPaymentInByIdController)

router.put("/paymentIn/update-payment-in/:id", protect, validate(updatePaymentIn), authorizePermission('payment-in:update'), updatePaymentInController)

router.delete("/paymentIn/delete-payment-in/:id", protect, restrictToRoles("admin"), deletePaymentInController)

router.get("/paymentIn/get-next-payment-in-number", protect, authorizePermission('payment-in:read'), getNextPaymentInNumberController)


export default router;