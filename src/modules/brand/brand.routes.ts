import { Router } from "express";
import * as BrandController from "./brand.controller";
import { authorizePermission, protect, restrictToRoles } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
    brandValidationSchema,
    brandUpdateValidationSchema,
    brandIdParamSchema
} from "./brand.validation";
import { upload } from "../../middlewares/upload.middleware";

const router = Router();

// POST - Create new brand
router.post(
    "/brand/add-brand",
    protect,
    authorizePermission('brand:create'),
    upload.single("brandLogo"),
    validate(brandValidationSchema),
    BrandController.addBrand
);

// PUT - Update brand by ID
router.put(
    "/brand/update-brand/:id",
    protect,
    authorizePermission('brand:update'),
    upload.single("brandLogo"),
    validate(brandIdParamSchema, "params"), // Validate params
    validate(brandUpdateValidationSchema), // Validate body
    BrandController.updateBrand
);

// DELETE - Delete brand by ID (RESTful - using params)
router.delete(
    "/brand/delete-brand/:id",
    protect,
    restrictToRoles("admin"),
    validate(brandIdParamSchema, "params"),
    BrandController.deleteBrand
);

// GET - Get all brands
router.get(
    "/brand/get-all-brands",
    protect,
    authorizePermission('brand:list'),
    BrandController.getAllBrands
);

// GET - Get brand by ID
router.get(
    "/brand/get-brand/:id",
    protect,
    authorizePermission('brand:read'),
    validate(brandIdParamSchema, "params"),
    BrandController.getBrandById
);

// GET - Get brands by manufacture type
router.get(
    "/brand/get-by-manufacture-type/:manufactureType",
    protect,
    authorizePermission('brand:list'),
    BrandController.getBrandsByManufactureType
);

export default router;