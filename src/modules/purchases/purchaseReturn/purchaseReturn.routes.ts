import { Router } from "express";
import { authorizePermission, protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { purchaseReturnSchema, updatePurchaseReturn } from "./purchaseReturn.validation";
import { createPurchaseReturnController, deletePurchaseReturnController, getAllPurchaseReturnController, getNextPurchaseReturnNumberController, getPurchaseReturnByIdController, updatePurchaseReturnController } from "./purchaseReturn.controller";

const router = Router();

router.post("/purchaseReturn/create-purchase-return", protect, validate(purchaseReturnSchema), authorizePermission('purchase-return:create'), createPurchaseReturnController)

router.get("/purchaseReturn/get-all-purchase-returns", protect, authorizePermission('purchase-return:list'), getAllPurchaseReturnController)

router.get("/purchaseReturn/get-single-purchase-return/:id", protect, authorizePermission('purchase-return:read'), getPurchaseReturnByIdController)

router.put("/purchaseReturn/update-purchase-return/:id", protect, validate(updatePurchaseReturn), authorizePermission('purchase-return:update'), updatePurchaseReturnController)

router.delete("/purchaseReturn/delete-purchase-return/:id", protect, restrictToRoles("admin"), deletePurchaseReturnController)

router.get("/purchaseReturn/get-next-purchase-return-number", protect, authorizePermission('purchase-return:read'), getNextPurchaseReturnNumberController)

export default router;