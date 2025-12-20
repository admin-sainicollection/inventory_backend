import Attendance, { IAttendance } from "./attendance.model";
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
                in_time: '12:00',
                out_time: '12:00',
                working_hour: 0,
                overtime_hour: 0,
                advance_amount: 0,
                attendance_status: 'Absent' as string,
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

// get attendance monthly
export const getEmployeeMonthlyAttendanceService = async (employeeId: string, month: string): Promise<ServiceResponse<any>> => {
    try {
        if (!employeeId) {
            throw new Error("Employee id is required")
        }
        const targetMonth = month ? new Date(month) : new Date();
        const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        const attendanceRecords = await Attendance.find({
            date: {
                $gte: startOfMonth,
                $lte: endOfMonth
            },
            'attendanceEntries.employee_id': employeeId
        }).select('date attendanceEntries.$').sort({ date: 1 });

        const employee = await Employee.findById(employeeId).select(`first_name last_name photo job.employee_type job.base_salary`)

        if (!employee) {
            throw new Error("Employee not found")
        }

        const formattedAttendance = attendanceRecords.map(record => {
            const entry = record.attendanceEntries[0];
            return {
                date: record.date,
                in_time: entry?.in_time,
                out_time: entry?.out_time,
                working_hour: entry?.working_hour,
                overtime_hour: entry?.overtime_hour,
                advance_amount: entry?.advance_amount,
                attendance_status: entry?.attendance_status,
                note: entry?.note
            }
        })

        const totalDays = formattedAttendance.length;
        const presentDays = formattedAttendance.filter(d => d.attendance_status === 'Present').length;
        const absentDays = formattedAttendance.filter(d => d.attendance_status === 'Absent').length;
        const halfDays = formattedAttendance.filter(d => d.attendance_status === 'Half Day').length;
        const paidLeaveDays = formattedAttendance.filter(d => d.attendance_status === 'Paid Leave').length;
        const weekOffDays = formattedAttendance.filter(d => d.attendance_status === 'Week Off').length;
        const holidayDays = formattedAttendance.filter(d => d.attendance_status === 'Holiday').length;

        const totalWorkingHours = formattedAttendance.reduce((sum, d) => sum + (d.working_hour ?? 0), 0);
        const totalOvertimeHours = formattedAttendance.reduce((sum, d) => sum + (d.overtime_hour ?? 0), 0);
        const totalAdvance = formattedAttendance.reduce((sum, d) => sum + (d.advance_amount ?? 0), 0);

        return {
            status: 'success',
            message: 'Monthly attendance fetched successfully',
            data: {
                employee: {
                    _id: employee._id,
                    name: `${employee.first_name} ${employee.last_name}`,
                    employee_type: employee.job?.employee_type,
                    base_salary: employee.job?.base_salary,
                    photo: employee.photo
                },
                month: targetMonth.toISOString().slice(0, 7), // YYYY-MM
                attendance: formattedAttendance,
                summary: {
                    totalDays,
                    presentDays,
                    absentDays,
                    halfDays,
                    paidLeaveDays,
                    weekOffDays,
                    holidayDays,
                    totalWorkingHours,
                    totalOvertimeHours,
                    totalAdvance,
                    attendancePercentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
                }
            }
        };
    } catch (error: any) {
        console.error('Get monthly attendance error:', error);
        throw new Error(`Failed to fetch monthly attendance: ${error.message}`);
    }
}