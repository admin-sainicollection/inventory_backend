import { Router } from "express";
import * as EmployeeController from './employee.controller';
import { protect, restrictToRoles } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";

const router = Router();

const uploadFields = upload.fields([
    { name: "photo_file", maxCount: 1 },
    { name: "aadhaar_front_file", maxCount: 1 },
    { name: "aadhaar_back_file", maxCount: 1 },
    { name: "pan_file", maxCount: 1 },
]);

router.post('/employee/add-employee', uploadFields, protect, restrictToRoles('admin'), EmployeeController.addEmployee);

router.get('/employee/get-all-employees', protect, restrictToRoles('admin'), EmployeeController.getEmployees);

router.get('/employee/get-single-employee/:id', protect, restrictToRoles('admin'), EmployeeController.getEmployeeById);

router.put('/employee/update-employee/:id', protect, restrictToRoles('admin'), EmployeeController.updateEmployee);

router.delete('/employee/delete-employee/:id', protect, restrictToRoles('admin'), EmployeeController.deleteEmployee);

export default router;   