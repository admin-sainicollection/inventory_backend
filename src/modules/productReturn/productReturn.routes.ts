import { Router } from "express";
import { protect, restrictToRoles } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { addStatusNoteController, createProductReturnController, deleteProductReturnController, getAllProductReturnController, getNextProductReturnNumberController, getProductReturnByIdController, updateProductReturnController } from "./productReturn.controller";
import { baseCreateProductReturnSchema, updateProductReturnSchema } from "./productReturn.validation";

const router = Router();

router.post("/productReturn/create-product-return", protect, validate(baseCreateProductReturnSchema), restrictToRoles("admin"), createProductReturnController)

router.post("/productReturn/add-status-note/:id", protect, restrictToRoles("admin"), addStatusNoteController)

router.get("/productReturn/get-all-product-returns", protect, restrictToRoles("admin"), getAllProductReturnController)

router.get("/productReturn/get-single-product-return/:id", protect, restrictToRoles("admin"), getProductReturnByIdController)

router.put("/productReturn/update-product-return/:id", protect, validate(updateProductReturnSchema), restrictToRoles("admin"), updateProductReturnController)

router.delete("/productReturn/delete-product-return/:id", protect, restrictToRoles("admin"), deleteProductReturnController)

router.get("/productReturn/get-next-product-return-number", protect, restrictToRoles('admin'), getNextProductReturnNumberController)


export default router;