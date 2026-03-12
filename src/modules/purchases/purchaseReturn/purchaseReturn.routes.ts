import { Router } from "express";
import { protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { purchaseReturnSchema, updatePurchaseReturn } from "./purchaseReturn.validation";
import { createPurchaseReturnController, deletePurchaseReturnController, getAllPurchaseReturnController, getNextPurchaseReturnNumberController, getPurchaseReturnByIdController, updatePurchaseReturnController } from "./purchaseReturn.controller";

const router = Router();

router.post("/purchaseReturn/create-purchase-return", protect, validate(purchaseReturnSchema), restrictToRoles("admin"), createPurchaseReturnController)

router.get("/purchaseReturn/get-all-purchase-returns", protect, restrictToRoles("admin"), getAllPurchaseReturnController)

router.get("/purchaseReturn/get-single-purchase-return/:id", protect, restrictToRoles("admin"), getPurchaseReturnByIdController)

router.put("/purchaseReturn/update-purchase-return/:id", protect, validate(updatePurchaseReturn), restrictToRoles("admin"), updatePurchaseReturnController)

router.delete("/purchaseReturn/delete-purchase-return/:id", protect, restrictToRoles("admin"), deletePurchaseReturnController)

router.get("/purchaseReturn/get-next-purchase-return-number", protect, restrictToRoles('admin'), getNextPurchaseReturnNumberController)


export default router;