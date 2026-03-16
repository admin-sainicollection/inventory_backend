import { Router } from "express";
import { protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { paymentOutSchema, updatePaymentOut } from "./paymentOut.validation";
import { createPaymentOutController, deletePaymentOutController, getAllPaymentOutController, getNextPaymentOutNumberController, getPaymentOutByIdController, updatePaymentOutController } from "./paymentOut.controller";

const router = Router();

router.post("/paymentOut/create-payment-out", protect, validate(paymentOutSchema), restrictToRoles("admin"), createPaymentOutController)

router.get("/paymentOut/get-all-payment-outs", protect, restrictToRoles("admin"), getAllPaymentOutController)

router.get("/paymentOut/get-single-payment-out/:id", protect, restrictToRoles("admin"), getPaymentOutByIdController)

router.put("/paymentOut/update-payment-out/:id", protect, validate(updatePaymentOut), restrictToRoles("admin"), updatePaymentOutController)

router.delete("/paymentOut/delete-payment-out/:id", protect, restrictToRoles("admin"), deletePaymentOutController)

router.get("/paymentOut/get-next-payment-out-number", protect, restrictToRoles('admin'), getNextPaymentOutNumberController)


export default router;