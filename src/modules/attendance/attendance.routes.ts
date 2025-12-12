import { Router } from "express";
import * as AttendanceController from './attendance.controller';
import { protect, restrictToRoles } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/attendance/add-attendance", protect, restrictToRoles('admin', 'manager'), AttendanceController.addAttendance);

export default router;