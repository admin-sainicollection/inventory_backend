import mongoose from 'mongoose';
import Employee, { IEmployee } from './employee.model';
import { uploadBuffer } from '../../config/cloudinary/cloudinary';
import User from '../users/user.model';
import Audit from '../audit/audit.model';
import { registerUser, updateUserService } from '../auth/auth.service';
import { saveImageLocally } from '../../utils/fileUploadHelper';
import { deleteMultipleImages } from '../../utils/fileDeleteHelper';

// Types for file handling
interface UploadedFile {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
}

export interface UploadedFiles {
    photo_file?: UploadedFile[];
    aadhaar_front_file?: UploadedFile[];
    aadhaar_back_file?: UploadedFile[];
    pan_file?: UploadedFile[];
}

export interface PaginationResult<T> {
    status: string;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    searchQuery?: string;
}

interface EmployeeStats {
    totalEmployees: number;
    activeEmployees: number;
    inactiveEmployees: number;
    avgSalary: number;
    totalSalary: number;
    typeDistribution: Array<{ type: string; count: number }>;
}

export interface ServiceResponse<T = any> {
    status: string;
    message: string;
    data?: T;
}

// Helper function to parse FormData
// const parseFormData = (data: any): Partial<IEmployee> => {
//     return {
//         ...data,
//         contact: data.contact ? JSON.parse(data.contact) : { phone: [], email: [] },
//         address: data.address ? JSON.parse(data.address) : {},
//         job: data.job ? JSON.parse(data.job) : {},
//         document: data.document ? JSON.parse(data.document) : {},
//         finance: data.finance ? JSON.parse(data.finance) : {},
//     };
// };
// Helper function to parse FormData
const parseFormData = (data: any): Partial<IEmployee> => {
    try {
        // If data is already a JSON string in the 'data' field
        if (typeof data === 'string') {
            return JSON.parse(data);
        }

        // If data has a 'data' field containing JSON
        if (data.data && typeof data.data === 'string') {
            const parsedData = JSON.parse(data.data);
            return parsedData;
        }

        // Otherwise return as is
        return data;
    } catch (error) {
        console.error('Error parsing form data:', error);
        return data;
    }
};

const collectEmployeeImages = (employee: any): string[] => {
    const images: string[] = [];

    // Photo
    if (employee.photo) {
        images.push(employee.photo);
    }

    // Aadhaar documents
    if (employee.document?.aadhaar?.aadhaar_photo_front) {
        images.push(employee.document.aadhaar.aadhaar_photo_front);
    }
    if (employee.document?.aadhaar?.aadhaar_photo_back) {
        images.push(employee.document.aadhaar.aadhaar_photo_back);
    }

    // PAN document
    if (employee.document?.pan?.pan_photo) {
        images.push(employee.document.pan.pan_photo);
    }

    return images;
};

const uploadEmployeeFiles = async (files: any) => {
    const uploads: any = {};

    if (files?.photo_file?.[0]?.buffer) {
        // uploads.photo = await uploadBuffer(
        //     files.photo_file[0].buffer,
        //     "employees/photos"
        // );
        uploads.photo = await saveImageLocally(
            files?.photo_file?.[0]?.buffer,
            "employees/photo",
            files?.photo_file?.[0]?.originalname
        );
    }

    if (files?.aadhaar_front_file?.[0]?.buffer) {
        // uploads.aadhaar_photo_front = await uploadBuffer(
        //     files.aadhaar_front_file[0].buffer,
        //     "employees/aadhaar/front"
        // );
        uploads.aadhaar_photo_front = await saveImageLocally(
            files?.aadhaar_front_file?.[0]?.buffer,
            "employees/aadhar",
            files?.aadhaar_front_file?.[0]?.originalname
        );
    }

    if (files?.aadhaar_back_file?.[0]?.buffer) {
        // uploads.aadhaar_photo_back = await uploadBuffer(
        //     files.aadhaar_back_file[0].buffer,
        //     "employees/aadhaar/back"
        // );
        uploads.aadhaar_photo_back = await saveImageLocally(
            files?.aadhaar_back_file?.[0]?.buffer,
            "employees/aadhar",
            files?.aadhaar_back_file?.[0]?.originalname
        );
    }

    if (files?.pan_file?.[0]?.buffer) {
        // uploads.pan_photo = await uploadBuffer(
        //     files.pan_file[0].buffer,
        //     "employees/pan"
        // );
        uploads.pan_photo = await saveImageLocally(
            files?.pan_file?.[0]?.buffer,
            "employees/pan",
            files?.pan_file?.[0]?.originalname
        );
    }

    return uploads;
};


export const addEmployeeService = async (
    data: any, // This will include username, email, password, role along with employee data
    files: UploadedFiles
) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Parse the form data
        const employeeData = typeof data === 'string' ? JSON.parse(data) : data;

        // 1. CREATE USER FIRST
        // Check if user with same email or username exists
        const existingUser = await User.findOne({
            $or: [
                { email: employeeData.email },
                { userName: employeeData.username }
            ]
        }).session(session);

        if (existingUser) {
            throw new Error("User with this email or username already exists");
        }


        // Create full name from first and last name
        const fullName = `${employeeData.first_name} ${employeeData.last_name || ''}`.trim();

        const user = await registerUser({
            name: fullName,
            userName: employeeData.username,
            email: employeeData.contact?.email?.[0],
            password: employeeData.password,
            // phoneNumber: employeeData.contact?.phone?.[0]?.phone_no, // Take first phone number
            // address: employeeData.address,
            roleId: employeeData.role,
        })

        // 2. PREPARE EMPLOYEE DATA (exclude user-specific fields)
        const employeeCreateData: Partial<IEmployee> = {
            first_name: employeeData.first_name,
            last_name: employeeData.last_name,
            dob: employeeData.dob,
            gender: employeeData.gender,
            contact: employeeData.contact,
            address: employeeData.address,
            job: employeeData.job,
            document: employeeData.document,
            finance: employeeData.finance,
            userId: user?._id, // Link to the created user
        };

        // Upload files and attach URLs (keeping your existing file upload logic)
        const uploadedFiles = await uploadEmployeeFiles(files);

        // ✅ Attach uploaded URLs (your existing code)
        if (uploadedFiles.photo) {
            employeeCreateData.photo = uploadedFiles.photo;
        }

        if (uploadedFiles.aadhaar_photo_front || uploadedFiles.aadhaar_photo_back) {
            employeeCreateData.document ??= {};
            employeeCreateData.document.aadhaar ??= {};

            if (uploadedFiles.aadhaar_photo_front) {
                employeeCreateData.document.aadhaar.aadhaar_photo_front =
                    uploadedFiles.aadhaar_photo_front;
            }

            if (uploadedFiles.aadhaar_photo_back) {
                employeeCreateData.document.aadhaar.aadhaar_photo_back =
                    uploadedFiles.aadhaar_photo_back;
            }
        }

        if (uploadedFiles.pan_photo) {
            employeeCreateData.document ??= {};
            employeeCreateData.document.pan ??= {};
            employeeCreateData.document.pan.pan_photo = uploadedFiles.pan_photo;
        }

        // ✅ Convert dates (your existing code)
        if (employeeCreateData.dob) {
            employeeCreateData.dob = new Date(employeeCreateData.dob);
        }

        if (employeeCreateData.job?.joining_date) {
            employeeCreateData.job.joining_date = new Date(
                employeeCreateData.job.joining_date
            );
        }

        // Convert base_salary to number if it's a string
        if (employeeCreateData.job?.base_salary && typeof employeeCreateData.job.base_salary === 'string') {
            employeeCreateData.job.base_salary = Number(employeeCreateData.job.base_salary);
        }

        // Convert aadhaar number to number if it's a string
        if (employeeCreateData.document?.aadhaar?.aadhaar_no &&
            typeof employeeCreateData.document.aadhaar.aadhaar_no === 'string') {
            employeeCreateData.document.aadhaar.aadhaar_no =
                Number(employeeCreateData.document.aadhaar.aadhaar_no);
        }

        // Create employee
        const [employee] = await Employee.create([employeeCreateData], { session });

        // Commit transaction
        await session.commitTransaction();

        // Return the created employee with populated user data
        const populatedEmployee = await Employee.findById(employee?._id)
            .populate('userId', 'name userName email role status')
            .lean();

        return {
            status: "success",
            message: "Employee and user account created successfully",
            data: populatedEmployee,
        };

    } catch (error: any) {
        // Rollback transaction on error
        await session.abortTransaction();
        throw new Error(error.message);
    } finally {
        session.endSession();
    }
};


export const updateEmployeeService = async (
    id: string,
    data: Partial<IEmployee>,
    files: UploadedFiles
) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const existingEmployee = await Employee.findById(id).session(session);
        if (!existingEmployee) {
            throw new Error("Employee not found");
        }

        // Store old image paths for deletion
        const oldImages = collectEmployeeImages(existingEmployee);

        const updateData = parseFormData(data);

        // Extract user-related fields
        const userUpdateData: any = {};

        if (updateData.username) {
            userUpdateData.userName = updateData.username;
            delete updateData.username;
        }

        if (updateData.password) {
            userUpdateData.password = updateData.password;
            delete updateData.password;
        }

        if (updateData.role) {
            userUpdateData.role = updateData.role;
            delete updateData.role;
        }

        // Handle file uploads for employee
        const uploadedFiles = await uploadEmployeeFiles(files);

        // Track which images will be replaced (to delete old ones)
        const imagesToDelete: string[] = [];

        // ✅ PHOTO - Delete old photo if new one is uploaded
        if (uploadedFiles.photo) {
            updateData.photo = uploadedFiles.photo;
            if (existingEmployee.photo) {
                imagesToDelete.push(existingEmployee.photo);
            }
        } else if (updateData.photo?.startsWith("http")) {
            updateData.photo = updateData.photo;
        } else {
            updateData.photo = existingEmployee.photo as string;
        }

        // ✅ DOCUMENTS
        updateData.document ??= {};
        updateData.document.aadhaar ??= existingEmployee.document?.aadhaar || {};
        updateData.document.pan ??= existingEmployee.document?.pan || {};

        // ✅ AADHAAR FRONT - Delete old if new is uploaded
        if (uploadedFiles.aadhaar_photo_front) {
            updateData.document.aadhaar.aadhaar_photo_front = uploadedFiles.aadhaar_photo_front;
            if (existingEmployee.document?.aadhaar?.aadhaar_photo_front) {
                imagesToDelete.push(existingEmployee.document.aadhaar.aadhaar_photo_front);
            }
        }

        // ✅ AADHAAR BACK - Delete old if new is uploaded
        if (uploadedFiles.aadhaar_photo_back) {
            updateData.document.aadhaar.aadhaar_photo_back = uploadedFiles.aadhaar_photo_back;
            if (existingEmployee.document?.aadhaar?.aadhaar_photo_back) {
                imagesToDelete.push(existingEmployee.document.aadhaar.aadhaar_photo_back);
            }
        }

        // ✅ PAN PHOTO - Delete old if new is uploaded
        if (uploadedFiles.pan_photo) {
            updateData.document.pan.pan_photo = uploadedFiles.pan_photo;
            if (existingEmployee.document?.pan?.pan_photo) {
                imagesToDelete.push(existingEmployee.document.pan.pan_photo);
            }
        }

        // ✅ Handle removal of images from frontend (if image fields become empty)
        // Check if photo was removed
        if (updateData.photo === "" || updateData.photo === null) {
            if (existingEmployee.photo) {
                imagesToDelete.push(existingEmployee.photo);
            }
        }

        // Check if aadhaar front was removed
        if (updateData.document?.aadhaar?.aadhaar_photo_front === "" || updateData.document?.aadhaar?.aadhaar_photo_front === null) {
            if (existingEmployee.document?.aadhaar?.aadhaar_photo_front) {
                imagesToDelete.push(existingEmployee.document.aadhaar.aadhaar_photo_front);
            }
        }

        // Check if aadhaar back was removed
        if (updateData.document?.aadhaar?.aadhaar_photo_back === "" || updateData.document?.aadhaar?.aadhaar_photo_back === null) {
            if (existingEmployee.document?.aadhaar?.aadhaar_photo_back) {
                imagesToDelete.push(existingEmployee.document.aadhaar.aadhaar_photo_back);
            }
        }

        // Check if pan photo was removed
        if (updateData.document?.pan?.pan_photo === "" || updateData.document?.pan?.pan_photo === null) {
            if (existingEmployee.document?.pan?.pan_photo) {
                imagesToDelete.push(existingEmployee.document.pan.pan_photo);
            }
        }

        // ✅ Delete old images from local storage
        const uniqueImagesToDelete = [...new Set(imagesToDelete)];
        if (uniqueImagesToDelete.length > 0) {
            console.log("🗑️ Deleting employee images:", uniqueImagesToDelete);
            deleteMultipleImages(uniqueImagesToDelete);
        }

        // ✅ Type conversions for employee data
        if (typeof updateData.dob === "string") {
            updateData.dob = new Date(updateData.dob);
        }

        if (typeof updateData.job?.joining_date === "string") {
            updateData.job.joining_date = new Date(
                updateData.job.joining_date
            );
        }

        if (updateData.job?.base_salary) {
            updateData.job.base_salary = Number(updateData.job.base_salary);
        }

        if (updateData.document?.aadhaar?.aadhaar_no) {
            updateData.document.aadhaar.aadhaar_no = Number(
                updateData.document.aadhaar.aadhaar_no
            );
        }

        // Update employee
        const updatedEmployee = await Employee.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true, session }
        );

        if (!updatedEmployee) {
            throw new Error("Failed to update employee");
        }

        // Update associated user if userId exists and there are user fields to update
        if (existingEmployee.userId && Object.keys(userUpdateData).length > 0) {
            try {
                await updateUserService(
                    existingEmployee.userId.toString(),
                    userUpdateData
                );
            } catch (userError: any) {
                console.error("Error updating associated user:", userError);
            }
        }

        await session.commitTransaction();

        // Fetch the updated employee with populated user data
        const populatedEmployee = await Employee.findById(id)
            .populate('userId', 'name userName email role status')
            .lean();

        return {
            status: "success",
            message: "Employee updated successfully",
            data: populatedEmployee,
        };
    } catch (error: any) {
        await session.abortTransaction();
        throw new Error(error.message);
    } finally {
        session.endSession();
    }
};

export const getEmployeesService = async (
    filters: Record<string, any> = {},
    searchQuery: string = '',
    page: number = 1,
    limit: number = 10
) => {
    try {
        const skip = (page - 1) * limit;
        let query = Employee.find();

        // Apply filters
        if (Object.keys(filters).length > 0) {
            query = query.find(filters);
        }

        // Apply search if query is provided
        if (searchQuery && searchQuery.trim() !== '') {
            const searchRegex = new RegExp(searchQuery.trim(), 'i');
            const searchNum = isNaN(parseInt(searchQuery)) ? null : parseInt(searchQuery);

            const searchConditions: any = {
                $or: [
                    // Text fields
                    { first_name: searchRegex },
                    { last_name: searchRegex },
                    { gender: searchRegex },
                    { status: searchRegex },

                    // Contact
                    { 'contact.email': searchRegex },
                    { 'contact.phone.phone_no': searchRegex },

                    // Address
                    { 'address.line1': searchRegex },
                    { 'address.city': searchRegex },
                    { 'address.state': searchRegex },
                    { 'address.country': searchRegex },
                    { 'address.pin_code': searchRegex },

                    // Job
                    { 'job.employee_type': searchRegex },

                    // Document
                    { 'document.pan.pan_no': searchRegex },

                    // Finance
                    { 'finance.bank_ac_no': searchRegex },
                    { 'finance.ifsc_code': searchRegex },

                    // Convert number to string for search
                    {
                        $expr: {
                            $regexMatch: {
                                input: { $toString: '$job.base_salary' },
                                regex: searchRegex
                            },

                        }
                    }
                ]
            };

            // Add numeric search for aadhaar if applicable
            if (searchNum !== null) {
                searchConditions.$or.push({
                    'document.aadhaar.aadhaar_no': searchNum
                });
            }

            query = query.find(searchConditions);
        }

        // Get total count
        const totalQuery = query.clone();
        const total = await totalQuery.countDocuments();

        // Apply pagination and sorting
        const employees = await query
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }).populate({
                path: "userId",
                select: "name userName email status role",
                populate: {
                    path: "role",
                    select: "name"
                }
            }).lean()
            ; // Exclude version key

        return {
            status: 'success',
            data: employees,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            ...(searchQuery && searchQuery.trim() !== '' ? { searchQuery } : {})
        };
    } catch (error: any) {
        throw new Error(`Failed to fetch employees: ${error.message}`);
    }
};

export const getEmployeeByIdService = async (id: string) => {
    try {
        const employee = await Employee.findById(id).populate({
            path: "userId",
            select: "name userName email status role",
            populate: {
                path: "role",
                select: "name"
            }
        }).lean();
        if (!employee) {
            throw new Error('Employee not found');
        }
        return {
            status: 'success',
            message: 'Employee fetched successfully',
            data: employee
        };
    } catch (error: any) {
        throw new Error(`Failed to fetch employee: ${error.message}`);
    }
};

// export const deleteEmployeeService = async (id: string): Promise<ServiceResponse> => {
//     try {
//         const employee = await Employee.findByIdAndDelete(id);
//         if (!employee) {
//             throw new Error('Employee not found');
//         }
//         return {
//             status: 'success',
//             message: 'Employee deleted successfully'
//         };
//     } catch (error: any) {
//         throw new Error(`Failed to delete employee: ${error.message}`);
//     }
// };

export const deleteEmployeeService = async (id: string): Promise<ServiceResponse> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Find the employee first to get the userId
        const employee = await Employee.findById(id).session(session);

        if (!employee) {
            throw new Error('Employee not found');
        }

        // Store the userId before deleting the employee
        const userId = employee.userId;

        const employeeImages = collectEmployeeImages(employee);
        if (employeeImages.length > 0) {
            deleteMultipleImages(employeeImages);
        }

        // Delete the employee
        const deletedEmployee = await Employee.findByIdAndDelete(id).session(session);

        if (!deletedEmployee) {
            throw new Error('Failed to delete employee');
        }

        // Delete the associated user if it exists
        if (userId) {
            const deletedUser = await User.findByIdAndDelete(userId).session(session);

            if (!deletedUser) {
                // Log this warning but don't fail the transaction since employee is already deleted
                console.warn(`Warning: User with ID ${userId} not found for deletion. Employee ${id} was deleted successfully.`);
            } else {
                console.log(`Associated user ${userId} deleted successfully`);
            }
        }

        // Commit the transaction
        await session.commitTransaction();

        // Create audit log for the deletion
        await Audit.create({
            actorId: userId, // or some system user ID if you have one
            action: "employee:deleted",
            targetId: id,
            metadata: {
                employeeId: id,
                userId: userId,
                employeeName: `${employee.first_name} ${employee.last_name || ''}`.trim()
            }
        });

        return {
            status: 'success',
            message: 'Employee and associated user account deleted successfully'
        };
    } catch (error: any) {
        // Rollback the transaction if anything fails
        await session.abortTransaction();
        console.error('Error deleting employee and user:', error);
        throw new Error(`Failed to delete employee: ${error.message}`);
    } finally {
        session.endSession();
    }
};

export const updateEmployeeStatusService = async (
    id: string,
    status: 'active' | 'inactive'
): Promise<ServiceResponse<IEmployee>> => {
    try {
        const employee = await Employee.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        if (!employee) {
            throw new Error('Employee not found');
        }
        return {
            status: 'success',
            message: `Employee status updated to ${status}`,
            data: employee
        };
    } catch (error: any) {
        throw new Error(`Failed to update employee status: ${error.message}`);
    }
};

export const getEmployeeStatsService = async (): Promise<ServiceResponse<EmployeeStats>> => {
    try {
        const stats = await Employee.aggregate([
            {
                $group: {
                    _id: null,
                    totalEmployees: { $sum: 1 },
                    activeEmployees: {
                        $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
                    },
                    inactiveEmployees: {
                        $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
                    },
                    avgSalary: { $avg: '$job.base_salary' },
                    totalSalary: { $sum: '$job.base_salary' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalEmployees: 1,
                    activeEmployees: 1,
                    inactiveEmployees: 1,
                    avgSalary: { $round: ['$avgSalary', 2] },
                    totalSalary: 1
                }
            }
        ]);

        // Get employee type distribution
        const typeDistribution = await Employee.aggregate([
            {
                $group: {
                    _id: '$job.employee_type',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    type: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);

        return {
            status: 'success',
            message: 'Employee stats fetched successfully',
            data: {
                ...(stats[0] || {
                    totalEmployees: 0,
                    activeEmployees: 0,
                    inactiveEmployees: 0,
                    avgSalary: 0,
                    totalSalary: 0
                }),
                typeDistribution
            }
        };
    } catch (error: any) {
        throw new Error(`Failed to fetch employee stats: ${error.message}`);
    }
};