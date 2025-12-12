import Attendance , {IAttendance} from "./attendance.model";
import Employee from "./../employee/employee.model"

interface ServiceResponse<T = any> {
    status: string;
    message: string;
    data?: T;
}

export const addOrUpdateAttendanceService = async (attendanceData: IAttendance): Promise<ServiceResponse<IAttendance>> => {
    try {
        if (!attendanceData.date) {
            throw new Error("Date is required");
        }

        // Parse and normalize the date
        const targetDate = new Date(attendanceData.date);
        targetDate.setHours(0, 0, 0, 0);

        // Create date range for query
        const nextDate = new Date(targetDate);
        nextDate.setDate(nextDate.getDate() + 1);

        // Check if attendance exists for this date
        const existingAttendance = await Attendance.findOne({
            date: {
                $gte: targetDate,
                $lt: nextDate
            }
        });

        let savedAttendance: IAttendance;

        if (existingAttendance) {
            // UPDATE existing attendance
            existingAttendance.viewType = attendanceData.viewType || 'day';
            existingAttendance.attendanceEntries = attendanceData.attendanceEntries;
            existingAttendance.updatedAt = new Date();
            
            savedAttendance = await existingAttendance.save();
        } else {
            // CREATE new attendance
            const newAttendance = new Attendance({
                date: targetDate,
                viewType: attendanceData.viewType || 'day',
                attendanceEntries: attendanceData.attendanceEntries
            });
            
            savedAttendance = await newAttendance.save();
        }

        // Populate employee details
        const populatedAttendance = await Attendance.findById(savedAttendance._id)
            .populate({
                path: 'attendanceEntries.employee_id',
                select: 'first_name last_name photo job.employee_type'
            });

        return {
            status: 'success',
            message: existingAttendance ? 'Attendance updated successfully' : 'Attendance added successfully',
            data: populatedAttendance || savedAttendance
        };
    } catch (error: any) {
        console.error('Attendance service error:', error);
        throw new Error(`Failed to save attendance: ${error.message}`);
    }
};

// get attendance by date
export const getAttendanceByDateService = async (date: string): Promise<ServiceResponse<IAttendance>> => {
    try {
        if (!date) {
            throw new Error("Date parameter is required");
        }

        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        const nextDate = new Date(targetDate);
        nextDate.setDate(nextDate.getDate() + 1);

        // Find attendance for the specific date
        let attendance = await Attendance.findOne({
            date: {
                $gte: targetDate,
                $lt: nextDate
            }
        }).populate({
            path: 'attendanceEntries.employee_id',
            select: 'first_name last_name photo job.employee_type status'
        });

        // If no attendance exists, create a default one with all active employees
        if (!attendance) {
            // Get all active employees
            const activeEmployees = await Employee.find({ status: 'active' }).select('_id first_name last_name');
            
            if (activeEmployees.length === 0) {
                throw new Error("No active employees found");
            }

            // Create default attendance entries
            const defaultEntries = activeEmployees.map(emp => ({
                employee_id: emp._id,
                in_time: '09:00',
                out_time: '18:00',
                working_hour: 9,
                overtime_hour: 0,
                advance_amount: 0,
                attendance_status: 'Present' as string,
                note: ''
            }));

            // Create default attendance but don't save it to database yet
            attendance = new Attendance({
                date: targetDate,
                viewType: 'day',
                attendanceEntries: defaultEntries
            });

            // Populate employee details
            await attendance.populate({
                path: 'attendanceEntries.employee_id',
                select: 'first_name last_name photo job.employee_type status'
            });

            return {
                status: 'success',
                message: 'Default attendance loaded (not saved yet)',
                data: attendance
            };
        }

        return {
            status: 'success',
            message: 'Attendance fetched successfully',
            data: attendance
        };
    } catch (error: any) {
        console.error('Get attendance error:', error);
        throw new Error(`Failed to fetch attendance: ${error.message}`);
    }
};