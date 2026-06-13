import { Router } from "express";
import * as Controller from "./compatibility.controller";
import { authorizePermission, protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import {  deleteCarModelSchema } from "./compatibility.validation";
import { upload } from "../../../middlewares/upload.middleware";

const router = Router();

router.post('/compatibility/add-car-model', protect, upload.fields([{ name: "baseImage", maxCount: 1 }, { name: "generationImages", maxCount: 50 }]), authorizePermission('car:create'), Controller.addCarModel);
router.put('/compatibility/update-car-model/:id', protect, upload.fields([{ name: "baseImage", maxCount: 1 }, { name: "generationImages", maxCount: 50 }]), authorizePermission('car:update'), Controller.updateCarModel);
router.delete('/compatibility/delete-car-model', protect, restrictToRoles('admin'), validate(deleteCarModelSchema), Controller.deleteCarModel);
router.get('/compatibility/get-car-model/:id', protect, authorizePermission('car:read'), Controller.getCarModelById);
router.get('/compatibility/get-all-car-models',protect, authorizePermission('car:list'), Controller.getAllCarModels);

export default router;