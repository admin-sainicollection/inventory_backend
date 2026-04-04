import { Router } from "express";
import * as AttendanceController from './attendance.controller';
import { authorizePermission, protect, restrictToRoles } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/attendance/add-update-attendance", protect, authorizePermission('attendance:create'), AttendanceController.addOrUpdateAttendance);

router.get("/attendance/get-attendance", protect, authorizePermission('attendance:read'), AttendanceController.getAttendanceByDate);

router.get("/attendance/employee-monthly-attendance/:employeeId", protect, authorizePermission('attendance:check'), AttendanceController.getEmployeeMonthlyAttendance);

router.delete("/attendance/delete-attendance/:date", protect, restrictToRoles('admin'), AttendanceController.deleteAttendance)

export default router;