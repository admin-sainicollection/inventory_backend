import { Request, Response } from "express";
import { addOrUpdateAttendanceService, getAttendanceByDateService, getEmployeeMonthlyAttendanceService } from "./attendance.service";
import Attendance from './attendance.model'

export const addOrUpdateAttendance = async (req: Request, res: Response): Promise<void> => {
    try {
        const attendanceData = req.body;

        // Validate required fields
        if (!attendanceData.date) {
            res.status(400).json({
                status: "error",
                message: "Date is required"
            });
            return;
        }

        if (!attendanceData.attendanceEntries || !Array.isArray(attendanceData.attendanceEntries)) {
            res.status(400).json({
                status: "error",
                message: "Attendance entries are required"
            });
            return;
        }

        const result = await addOrUpdateAttendanceService(attendanceData);

        res.status(200).json(result);
    } catch (error: any) {
        console.error('Add/Update attendance error:', error);
        res.status(400).json({
            status: "error",
            message: error.message
        });
    }
};

// get attendance by date
export const getAttendanceByDate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { date } = req.query;
        if (!date) {
            res.status(400).json({
                status: "error",
                message: "Date parameter is required"
            })
        }
        const result = await getAttendanceByDateService(date as string);
        res.status(200).json(result)
    } catch (error: any) {
        res.status(400).json({
            status: "error",
            message: error.message
        })
    }
}

// get monthly attendance
export const getEmployeeMOnthlyAttendance = async (req: Request, res: Response): Promise<void> => {
    try {
        const { employeeId } = req.params;
        const { month } = req.query;
        if (!employeeId) {
            res.status(400).json({
                status: "error",
                message: "Employee ID is required"
            })
            return;
        }

        const result = await getEmployeeMonthlyAttendanceService(employeeId, month as string);
        res.status(200).json(result);
    } catch (error: any) {
        console.error("Monthly attendance error : ", error)
        res.status(400).json({
            status: "error",
            message: error.message
        })
    }
}

// delete attendance
export const deleteAttendance = async (req: Request, res: Response): Promise<void> => {
    try {
        const { date } = req.params;
        
        if (!date) {
            res.status(400).json({
                status: "error",
                message: "Date parameter is required"
            });
            return;
        }

        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const nextDate = new Date(targetDate);
        nextDate.setDate(nextDate.getDate() + 1);

        const deleted = await Attendance.findOneAndDelete({
            date: {
                $gte: targetDate,
                $lt: nextDate
            }
        });

        if (!deleted) {
            res.status(404).json({
                status: "error",
                message: "Attendance not found for this date"
            });
            return;
        }

        res.status(200).json({
            status: "success",
            message: "Attendance deleted successfully"
        });
    } catch (error: any) {
        console.error('Delete attendance error:', error);
        res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};