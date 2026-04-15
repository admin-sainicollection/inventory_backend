import { Router } from "express";
import * as EmployeeController from './employee.controller';
import { authorizePermission, protect, restrictToRoles } from "../../middlewares/auth.middleware";
import { upload } from "../../middlewares/upload.middleware";

const router = Router();

const uploadFields = upload.fields([
    { name: "photo_file", maxCount: 1 },
    { name: "aadhaar_front_file", maxCount: 1 },
    { name: "aadhaar_back_file", maxCount: 1 },
    { name: "pan_file", maxCount: 1 },
]);

router.post('/employee/add-employee', uploadFields, protect,  authorizePermission('employee:create'), EmployeeController.addEmployee);

router.put('/employee/update-employee/:id',uploadFields,  protect, authorizePermission('employee:update'), EmployeeController.updateEmployee);

router.get('/employee/get-all-employees', protect, authorizePermission('employee:list'), EmployeeController.getEmployees);

router.get('/employee/get-single-employee/:id', protect,authorizePermission('employee:read'), EmployeeController.getEmployeeById);


router.delete('/employee/delete-employee/:id', protect, restrictToRoles('admin'), EmployeeController.deleteEmployee);

export default router;   