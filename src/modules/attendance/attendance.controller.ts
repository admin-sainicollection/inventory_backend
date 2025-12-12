import { Request, Response } from "express";
import { addAttendanceService } from "./attendance.service";

export const addAttendance = async (req:Request, res:Response)=>{
    try {
        const result = await addAttendanceService(req.body);
        res.status(201).json({
            status:"success",
            message:"Attendance Saved successfully",
            data: result
        })
    } catch (error:any) {
        res.status(400).json({
            status:"error",
            message: error.message
        })
    }
}