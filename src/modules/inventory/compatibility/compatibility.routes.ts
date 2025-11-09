import { Router } from "express";
import * as Controller from "./compatibility.controller";
import { protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { addCarModelSchema, deleteCarModelSchema, updateCarModelSchema } from "./compatibility.validation";
import { upload } from "../../../middlewares/upload.middleware";

const router = Router();

router.post('/compatibility/add-car-model', protect, upload.fields([{name:"baseImage", maxCount:1},{name:"generationImages", maxCount:5}]), restrictToRoles('admin'), Controller.addCarModel);
router.put('/compatibility/update-car-model/:id', protect,upload.fields([{name:"baseImage", maxCount:1},{name:"generationImages", maxCount:5}]), restrictToRoles('admin'), Controller.updateCarModel);
router.delete('/compatibility/delete-car-model', protect, restrictToRoles('admin'),validate(deleteCarModelSchema), Controller.deleteCarModel);
router.get('/compatibility/get-car-model/:id',protect, restrictToRoles('admin'), Controller.getCarModelById);
router.get('/compatibility/get-all-car-models', Controller.getAllCarModels);

export default router;