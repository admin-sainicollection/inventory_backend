import { Router } from "express";
import * as Controller from "./category.controller";
import { protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { createCategorySchema } from "./category.validation";

const router = Router();

router.post("/add-category",protect, restrictToRoles("admin"), validate(createCategorySchema), Controller.addCategory);

export default router;