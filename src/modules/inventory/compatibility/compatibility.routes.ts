import { Router } from "express";
import * as Controller from "./compatibility.controller";
import { protect, restrictToRoles } from "../../../middlewares/auth.middleware";
import { validate } from "../../../middlewares/validate.middleware";
import { addCarModelSchema, deleteCarModelSchema, updatedCarModelSchema } from "./compatibility.validation";

const router = Router();

router.post('/add-car-model', protect, restrictToRoles('admin'),validate(addCarModelSchema), Controller.addCarModel);
router.put('/update-car-model/:id', protect, restrictToRoles('admin'), validate(updatedCarModelSchema), Controller.updateCarModel);
router.delete('/delete-car-model', protect, restrictToRoles('admin'),validate(deleteCarModelSchema), Controller.deleteCarModel);
router.get('/get-all-car-models', Controller.getAllCarModels);

export default router;