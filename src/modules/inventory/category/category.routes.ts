import { Router } from "express";
import * as Controller from "./category.controller";
import { authorizePermission, protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { createCategorySchema, deleteCategorySchema, updateCategorySchema } from "./category.validation";

const router = Router();

router.post("/category/add-category", protect, authorizePermission('category:create'), validate(createCategorySchema), Controller.addCategory);
router.put("/category/update-category/:id", protect, authorizePermission('category:update'), validate(updateCategorySchema), Controller.updateCategory);
router.delete("/category/delete-category", protect, restrictToRoles("admin"), validate(deleteCategorySchema), Controller.deleteCategory);
router.get("/category/get-all-category",protect, authorizePermission('category:list'), Controller.getAllCategories);
router.get("/category/get-category/:id",protect, authorizePermission('category:read'), Controller.getCategoryById);

export default router;