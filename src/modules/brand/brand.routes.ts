import { Router } from "express";
import * as BrandController from "./brand.controller";
import { protect, restrictToRoles } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { brandValidationSchema } from "./brand.validation";
import { upload } from "../../middlewares/upload.middleware";

const router = Router();

router.post(
  "/brand/add-brand",
  protect,
  restrictToRoles("admin"),
  upload.single("brandLogo"), // ⬅️ must match form field name
  validate(brandValidationSchema),
  BrandController.addBrand
);

router.put(
  "/brand/update-brand/:id",
  protect,
  restrictToRoles("admin"),
  upload.single("brandLogo"), // ensure same field name as in frontend/form
  validate(brandValidationSchema),
  BrandController.updateBrand
);

router.delete(
    "/brand/delete-brand",
    protect,
    restrictToRoles("admin"),
    BrandController.deleteBrand
);

router.get("/brand/get-all-brands", protect, restrictToRoles("admin"), BrandController.getAllBrands);
router.get("/brand/get-brand/:id", protect, restrictToRoles("admin"), BrandController.getBrandById);

export default router;
