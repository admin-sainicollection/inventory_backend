import Attendance , {IAttendance} from "./attendance.model";

export const addAttendanceService = async (attendance:IAttendance):Promise<IAttendance>=>{
    try {
        if(!attendance.date){
            throw new Error("Date is required");
        }
        const dateExists = await Attendance.findOne({date:attendance.date});
        if(dateExists){
            throw new Error("Attendance for this date already exists");
        }
        const newAttendance = new Attendance(attendance);
        return await newAttendance.save();
    } catch (error) {
        throw error;
    }
}