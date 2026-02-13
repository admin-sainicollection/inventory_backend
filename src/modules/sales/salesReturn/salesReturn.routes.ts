import { Router } from "express";
import { protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { salesReturnSchema, updateSalesReturn } from "./salesReturn.validation";
import { createSalesReturnController, deleteSalesReturnController, getAllSalesReturnController, getNextSalesReturnNumberController, getSalesReturnByIdController, updateSalesReturnController } from "./salesReturn.controller";

const router = Router();

router.post("/salesReturn/create-sales-return", protect, validate(salesReturnSchema), restrictToRoles("admin"), createSalesReturnController)

router.get("/salesReturn/get-all-sales-returns", protect, restrictToRoles("admin"), getAllSalesReturnController)

router.get("/salesReturn/get-single-sales-return/:id", protect, restrictToRoles("admin"), getSalesReturnByIdController)

router.put("/salesReturn/update-sales-return/:id", protect, validate(updateSalesReturn), restrictToRoles("admin"), updateSalesReturnController)

router.delete("/salesReturn/delete-sales-return/:id", protect, restrictToRoles("admin"), deleteSalesReturnController)

router.get("/salesReturn/get-next-sales-return-number", protect, restrictToRoles('admin'), getNextSalesReturnNumberController)


export default router;