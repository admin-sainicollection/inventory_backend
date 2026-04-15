import { Router } from "express";
import { authorizePermission, protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { paymentOutSchema, updatePaymentOut } from "./paymentOut.validation";
import { createPaymentOutController, deletePaymentOutController, getAllPaymentOutController, getNextPaymentOutNumberController, getPaymentOutByIdController, updatePaymentOutController } from "./paymentOut.controller";

const router = Router();

router.post("/paymentOut/create-payment-out", protect, validate(paymentOutSchema), authorizePermission('payment-out:create'), createPaymentOutController)

router.get("/paymentOut/get-all-payment-outs", protect, authorizePermission('payment-out:list'), getAllPaymentOutController)

router.get("/paymentOut/get-single-payment-out/:id", protect, authorizePermission('payment-out:read'), getPaymentOutByIdController)

router.put("/paymentOut/update-payment-out/:id", protect, validate(updatePaymentOut), authorizePermission('payment-out:update'), updatePaymentOutController)

router.delete("/paymentOut/delete-payment-out/:id", protect, restrictToRoles("admin"), deletePaymentOutController)

router.get("/paymentOut/get-next-payment-out-number", protect, authorizePermission('payment-out:read'), getNextPaymentOutNumberController)


export default router;