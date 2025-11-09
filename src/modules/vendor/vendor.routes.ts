import { Router } from "express";
import * as VendorController from './vendor.controller';
import { protect, restrictToRoles } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { 
    vendorIdValidation, 
    vendorUpdateValidationSchema, 
    vendorValidationSchema,
    addPhoneValidationSchema,
    addEmailValidationSchema,
    phoneIndexValidation,
    emailIndexValidation
} from "./vendor.validation";

const router = Router();

// Basic CRUD routes
router.post("/vendor/add-vendor", 
    protect, 
    validate(vendorValidationSchema), 
    restrictToRoles("admin"), 
    VendorController.addVendor
);

router.put("/vendor/update-vendor/:id", 
    protect, 
    validate(vendorUpdateValidationSchema), 
    restrictToRoles("admin"), 
    VendorController.updateVendor
);

router.get("/vendor/get-all-vendors", 
    protect,  
    restrictToRoles('admin'), 
    VendorController.getAllVendors
);

router.get('/vendor/get-vendor/:id', 
    protect, 
    restrictToRoles("admin"), 
    VendorController.getVendorById
);

router.delete('/vendor/delete-vendor/:id', 
    protect, 
    restrictToRoles('admin'), 
    VendorController.deleteVendor
);

// Phone management routes
router.post('/vendor/:vendorId/phones', 
    protect, 
    validate(addPhoneValidationSchema), 
    restrictToRoles('admin'), 
    VendorController.addPhoneToVendor
);

router.delete('/vendor/:vendorId/phones/:phoneIndex', 
    protect, 
    restrictToRoles('admin'), 
    VendorController.removePhoneFromVendor
);

// Email management routes
router.post('/vendor/:vendorId/emails', 
    protect, 
    validate(addEmailValidationSchema), 
    restrictToRoles('admin'), 
    VendorController.addEmailToVendor
);

router.delete('/vendor/:vendorId/emails/:emailIndex', 
    protect, 
    restrictToRoles('admin'), 
    VendorController.removeEmailFromVendor
);

export default router;