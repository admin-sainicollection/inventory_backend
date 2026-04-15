import { Router } from "express";
import { authorizePermission, protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { salesReturnSchema, updateSalesReturn } from "./salesReturn.validation";
import { createSalesReturnController, deleteSalesReturnController, getAllSalesReturnController, getNextSalesReturnNumberController, getSalesReturnByIdController, updateSalesReturnController } from "./salesReturn.controller";

const router = Router();

router.post("/salesReturn/create-sales-return", protect, validate(salesReturnSchema), authorizePermission('sales-return:create'), createSalesReturnController)

router.get("/salesReturn/get-all-sales-returns", protect, authorizePermission('sales-return:list'), getAllSalesReturnController)

router.get("/salesReturn/get-single-sales-return/:id", protect, authorizePermission('sales-return:read'), getSalesReturnByIdController)

router.put("/salesReturn/update-sales-return/:id", protect, validate(updateSalesReturn), authorizePermission('sales-return:update'), updateSalesReturnController)

router.delete("/salesReturn/delete-sales-return/:id", protect, restrictToRoles("admin"), deleteSalesReturnController)

router.get("/salesReturn/get-next-sales-return-number", protect, authorizePermission('sales-return:read'), getNextSalesReturnNumberController)


export default router;