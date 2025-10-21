import { Router } from "express";
import * as VendorController from './vendor.controller';
import { protect, restrictToRoles } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { vendorIdValidation, vendorValidationSchema } from "./vendor.validation";

const router = Router();

router.post("/vendor/add-vendor", protect, validate(vendorValidationSchema), restrictToRoles("admin"), VendorController.addVendor)
router.put("/vendor/update-vendor/:id", protect, restrictToRoles("admin"), validate( vendorValidationSchema), VendorController.updateVendor)
router.get("/vendor/get-all-vendors", protect,  restrictToRoles('admin'), VendorController.getAllVendors)
router.get('/vendor/get-vendor/:id', protect, restrictToRoles("admin"), VendorController.getVendorById)
router.delete('/vendor/delete-vendor', protect, validate(vendorIdValidation), restrictToRoles('admin'), VendorController.deleteVendor)


export default router;