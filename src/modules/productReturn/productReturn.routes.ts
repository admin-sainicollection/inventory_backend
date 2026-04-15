import { Router } from "express";
import { authorizePermission, protect, restrictToRoles } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { addStatusNoteController, createProductReturnController, deleteProductReturnController, getAllProductReturnController, getNextProductReturnNumberController, getProductReturnByIdController, updateProductReturnController } from "./productReturn.controller";
import { baseCreateProductReturnSchema, updateProductReturnSchema } from "./productReturn.validation";

const router = Router();

router.post("/productReturn/create-product-return", protect, validate(baseCreateProductReturnSchema), authorizePermission('product-return:create'), createProductReturnController)

router.post("/productReturn/add-status-note/:id", protect, authorizePermission('product-return:create'), addStatusNoteController)

router.get("/productReturn/get-all-product-returns", protect, authorizePermission('product-return:list'), getAllProductReturnController)

router.get("/productReturn/get-single-product-return/:id", protect, authorizePermission('product-return:read'), getProductReturnByIdController)

router.put("/productReturn/update-product-return/:id", protect, validate(updateProductReturnSchema), authorizePermission('product-return:update'), updateProductReturnController)

router.delete("/productReturn/delete-product-return/:id", protect, restrictToRoles("admin"), deleteProductReturnController)

router.get("/productReturn/get-next-product-return-number", protect, authorizePermission('product-return:read'), getNextProductReturnNumberController)


export default router;