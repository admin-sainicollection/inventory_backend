import { Request, Response } from "express";
import {  addOrUpdateAttendanceService, getAttendanceByDateService } from "./attendance.service";

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
export const getAttendanceByDate = async (req:Request, res:Response):Promise<void>=>{
    try {
        const {date}= req.query;
        if(!date){
            res.status(400).json({
                status:"error",
                message:"Date parameter is required"
            })
        }
        const result = await getAttendanceByDateService(date as string);
        res.status(200).json(result)
    } catch (error: any) {
        res.status(400).json({
            status:"error",
            message:error.message
        })
    }
}