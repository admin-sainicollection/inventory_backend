import mongoose,{Schema, Document} from "mongoose";

export interface IAttendance extends Document {
    date: string | Date;
    viewType: 'day' | 'week' | 'month';
    attendanceEntries: Array<{
        employee_id: string;
        in_time: string;
        out_time: string;
        working_hour: number;
        overtime_hour: number;
        advance_amount: number;
        attendance_status: "Present" | "Absent" | "Half Day" | "Paid Leave" | "Week Off" | "Holiday";
        note: string;
    }>;
    creaedAt: Date;
    updatedAt: Date;
}

export const AttendanceSchema = new Schema<IAttendance>({
    date: { type: Date, required: true },
    viewType: { type: String, enum: ['day', 'week', 'month'], required: true },
    attendanceEntries: [
        {
            employee_id: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
            in_time: { type: String },
            out_time: { type: String },
            working_hour: { type: Number },
            overtime_hour: { type: Number },
            advance_amount: { type: Number },
            attendance_status: { 
                type: String, 
                enum: ["Present", "Absent", "Half Day", "Paid Leave", "Week Off", "Holiday"], 
                required: true 
            },
            note: { type: String }
        }
    ]
})

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema); 