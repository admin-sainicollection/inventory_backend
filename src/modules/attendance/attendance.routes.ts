import { Router } from "express";
import * as AttendanceController from './attendance.controller';
import { protect, restrictToRoles } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/attendance/add-update-attendance", protect, restrictToRoles('admin', 'manager'), AttendanceController.addOrUpdateAttendance);

router.get("/attendance/get-attendance", protect, restrictToRoles('admin', 'manager'), AttendanceController.getAttendanceByDate);

router.get("/attendance/employee-monthly-attendance/:employeeId", protect, restrictToRoles('admin', 'manager'), AttendanceController.getEmployeeMonthlyAttendance);

router.delete("/attendance/delete-attendance/:date", protect, restrictToRoles('admin','manager'), AttendanceController.deleteAttendance)

export default router;