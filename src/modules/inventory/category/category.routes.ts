import { Router } from "express";
import * as Controller from "./category.controller";
import { protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { createCategorySchema, deleteCategorySchema, updateCategorySchema } from "./category.validation";

const router = Router();

router.post("/add-category",protect, restrictToRoles("admin"), validate(createCategorySchema), Controller.addCategory);
router.put("/update-category/:id",protect, restrictToRoles("admin"), validate(updateCategorySchema), Controller.updateCategory);
router.delete("/delete-category",protect, restrictToRoles("admin"), validate(deleteCategorySchema), Controller.deleteCategory);
router.get("/get-all-category", Controller.getAllCategories);

export default router;