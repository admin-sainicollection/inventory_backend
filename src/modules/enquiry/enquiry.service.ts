import { Enquiry, IEnquiry, StatusType, Priority, Source } from './enquiry.model';
import { FilterQuery, Types } from 'mongoose';
import { CreateEnquiryData, FilterOptions, PaginatedResult, UpdateEnquiryData } from './types';

// Generate next enquiry number
export const generateNextEnquiryNumber = async (): Promise<string> => {
    try {
        const lastEnquiry = await Enquiry.findOne({}, {}, { sort: { enquiry_no: -1 } });

        let nextNumber = 1;
        if (lastEnquiry && lastEnquiry.enquiry_no) {
            const match = lastEnquiry.enquiry_no.match(/ENQ-(\d+)/);
            if (match && match[1]) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }

        return `ENQ-${nextNumber.toString().padStart(6, '0')}`;
    } catch (error) {
        // Fallback generation
        const now = new Date();
        const timestamp = now.getTime().toString().slice(-6);
        return `ENQ-${timestamp}`;
    }
};

// Create new enquiry
export const createEnquiry = async (enquiryData: CreateEnquiryData): Promise<IEnquiry> => {
    try {
        // Generate enquiry number
        const enquiry_no = await generateNextEnquiryNumber();

        const enquiry = new Enquiry({
            enquiry_no,
            ...enquiryData,
            // Remove hardcoded date - use date from frontend or default to current date
            enquiry_date: enquiryData.enquiry_date ? new Date(enquiryData.enquiry_date) : new Date()
        });

        // Auto-set assigned_date if employee is assigned
        if (enquiryData.assigned_employee_id && !enquiryData.status) {
            enquiry.status = 'ASSIGNED';
        }

        const savedEnquiry = await enquiry.save();
        return savedEnquiry;
    } catch (error) {
        throw new Error(`Failed to create enquiry: ${error}`);
    }
};

export const updateEnquiry = async (id: string, updateData: UpdateEnquiryData): Promise<IEnquiry | null> => {
    try {
        if (!Types.ObjectId.isValid(id)) {
            throw new Error('Invalid enquiry ID');
        }

        // Handle status-specific validations
        if (updateData.status === 'CLOSED' && !updateData.closed_result) {
            throw new Error('Closed result is required when status is CLOSED');
        }

        if (updateData.status === 'CANCELLED' && !updateData.cancelled_reason) {
            throw new Error('Cancellation reason is required when status is CANCELLED');
        }

        // If employee is being assigned, auto-set assigned_date
        if (updateData.assigned_employee_id && !updateData.assigned_date) {
            updateData.assigned_date = new Date();

            // If status is not set, default to ASSIGNED
            if (!updateData.status) {
                updateData.status = 'ASSIGNED';
            }
        }

        // If status is changed to CONVERTED, CLOSED, or CANCELLED, ensure assigned_employee_id exists
        if (['CONVERTED', 'CLOSED', 'CANCELLED'].includes(updateData.status || '')) {
            const existingEnquiry = await Enquiry.findById(id);
            if (existingEnquiry && !existingEnquiry.assigned_employee_id && !updateData.assigned_employee_id) {
                throw new Error('Enquiry must be assigned to an employee before converting/closing/cancelling');
            }
        }

        // Prepare update data - handle date conversion
        const updateDataToSend: any = { ...updateData, updatedAt: new Date() };

        // Convert enquiry_date if provided
        if (updateData.enquiry_date) {
            updateDataToSend.enquiry_date = new Date(updateData.enquiry_date);
        }

        // Convert assigned_date if provided
        if (updateData.assigned_date) {
            updateDataToSend.assigned_date = new Date(updateData.assigned_date);
        }

        const updatedEnquiry = await Enquiry.findByIdAndUpdate(
            id,
            updateDataToSend,
            { new: true, runValidators: true }
        )
            .populate('party', 'partyName nickName contact')
            .populate('assigned_employee', 'first_name last_name')
            .populate('products', 'name partNo');

        return updatedEnquiry;
    } catch (error) {
        throw new Error(`Failed to update enquiry: ${error}`);
    }
};

// Get enquiry by ID
export const getEnquiryById = async (id: string): Promise<IEnquiry | null> => {
    try {
        if (!Types.ObjectId.isValid(id)) {
            throw new Error('Invalid enquiry ID');
        }

        const enquiry = await Enquiry.findById(id)
            .populate('party', 'partyName nickName contact location entityCategory')
            .populate('assigned_employee', 'first_name last_name contact email')
            .populate('products', 'name partNo brand category mrp');

        return enquiry;
    } catch (error) {
        throw new Error(`Failed to get enquiry: ${error}`);
    }
};



// Get all enquiries with search and filters
export const getAllEnquiries = async (filters: FilterOptions = {}): Promise<PaginatedResult> => {
    try {
        const {
            search,
            status,
            priority,
            source,
            party_id,
            assigned_employee_id,
            startDate,
            endDate,
            page = 1,
            limit = 10
        } = filters;

        const query: FilterQuery<IEnquiry> = {};

        // Search across multiple fields
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { enquiry_no: searchRegex },
                { subject: searchRegex },
                { description: searchRegex },
                { closed_result: searchRegex },
                { cancelled_reason: searchRegex }
            ];
        }

        // Status filter
        if (status) {
            query.status = status;
        }

        // Priority filter
        if (priority) {
            query.priority = priority;
        }

        // Source filter
        if (source) {
            query.source = source;
        }

        // Party filter
        if (party_id && Types.ObjectId.isValid(party_id)) {
            query.party_id = new Types.ObjectId(party_id);
        }

        // Employee filter
        if (assigned_employee_id && Types.ObjectId.isValid(assigned_employee_id)) {
            query.assigned_employee_id = new Types.ObjectId(assigned_employee_id);
        }

        // Date range filter
        if (startDate || endDate) {
            query.enquiry_date = {};
            if (startDate) {
                query.enquiry_date.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.enquiry_date.$lte = end;
            }
        }

        // Calculate skip for pagination
        const skip = (page - 1) * limit;

        // Execute query with pagination and population
        const [enquiries, total] = await Promise.all([
            Enquiry.find(query)
                .sort({ enquiry_date: -1 })
                .skip(skip)
                .limit(limit)
                .populate('party', 'partyName nickName entityCategory')
                .populate('assigned_employee', 'first_name last_name')
                .populate('products', 'name partNo'),
            Enquiry.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: enquiries,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages
        };
    } catch (error) {
        throw new Error(`Failed to get enquiries: ${error}`);
    }
};

// Get enquiries by status
export const getEnquiriesByStatus = async (status: StatusType, page: number = 1, limit: number = 10): Promise<PaginatedResult> => {
    return getAllEnquiries({ status, page, limit });
};

// Get enquiries by priority
export const getEnquiriesByPriority = async (priority: Priority, page: number = 1, limit: number = 10): Promise<PaginatedResult> => {
    return getAllEnquiries({ priority, page, limit });
};

// Get enquiries by employee
export const getEnquiriesByEmployee = async (employeeId: string, page: number = 1, limit: number = 10): Promise<PaginatedResult> => {
    return getAllEnquiries({ assigned_employee_id: employeeId, page, limit });
};

// Get enquiries by party
export const getEnquiriesByParty = async (partyId: string, page: number = 1, limit: number = 10): Promise<PaginatedResult> => {
    return getAllEnquiries({ party_id: partyId, page, limit });
};

// Delete enquiry
export const deleteEnquiry = async (id: string): Promise<boolean> => {
    try {
        if (!Types.ObjectId.isValid(id)) {
            throw new Error('Invalid enquiry ID');
        }

        const result = await Enquiry.findByIdAndDelete(id);
        return !!result;
    } catch (error) {
        throw new Error(`Failed to delete enquiry: ${error}`);
    }
};

// Get enquiry statistics
export const getEnquiryStatistics = async (): Promise<any> => {
    try {
        const stats = await Enquiry.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    avgPriority: {
                        $avg: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ['$priority', 'HIGH'] }, then: 3 },
                                    { case: { $eq: ['$priority', 'MEDIUM'] }, then: 2 },
                                    { case: { $eq: ['$priority', 'LOW'] }, then: 1 }
                                ],
                                default: 2
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    status: '$_id',
                    count: 1,
                    avgPriority: 1,
                    _id: 0
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        const totalEnquiries = await Enquiry.countDocuments();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const enquiriesToday = await Enquiry.countDocuments({
            enquiry_date: { $gte: today }
        });

        return {
            total: totalEnquiries,
            today: enquiriesToday,
            byStatus: stats,
            summary: {
                new: await Enquiry.countDocuments({ status: 'NEW' }),
                assigned: await Enquiry.countDocuments({ status: 'ASSIGNED' }),
                inProgress: await Enquiry.countDocuments({ status: 'IN_PROGRESS' }),
                followUp: await Enquiry.countDocuments({ status: 'FOLLOW_UP' }),
                converted: await Enquiry.countDocuments({ status: 'CONVERTED' }),
                closed: await Enquiry.countDocuments({ status: 'CLOSED' }),
                cancelled: await Enquiry.countDocuments({ status: 'CANCELLED' })
            }
        };
    } catch (error) {
        throw new Error(`Failed to get enquiry statistics: ${error}`);
    }
};

// Convert enquiry to quotation/sales order
export const convertEnquiry = async (id: string, convertTo: 'QUOTATION' | 'SALES_ORDER', documentId: string): Promise<IEnquiry | null> => {
    try {
        if (!Types.ObjectId.isValid(id)) {
            throw new Error('Invalid enquiry ID');
        }

        const enquiry = await Enquiry.findById(id);
        if (!enquiry) {
            throw new Error('Enquiry not found');
        }

        if (!enquiry.canBeConverted()) {
            throw new Error('Enquiry cannot be converted from current status');
        }

        if (!enquiry.assigned_employee_id) {
            throw new Error('Enquiry must be assigned to an employee before conversion');
        }

        const updatedEnquiry = await Enquiry.findByIdAndUpdate(
            id,
            {
                status: 'CONVERTED',
                converted_to: convertTo,
                converted_document_id: documentId,
                converted_date: new Date(),
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        );

        return updatedEnquiry;
    } catch (error) {
        throw new Error(`Failed to convert enquiry: ${error}`);
    }
};

// Get enquiries that need follow-up
export const getFollowUpEnquiries = async (): Promise<IEnquiry[]> => {
    try {
        const today = new Date();
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(today.getDate() - 3);

        const enquiries = await Enquiry.find({
            status: { $in: ['ASSIGNED', 'IN_PROGRESS', 'FOLLOW_UP'] },
            updatedAt: { $lte: threeDaysAgo }
        })
            .sort({ updatedAt: 1 })
            .populate('party', 'partyName contact.phone')
            .populate('assigned_employee', 'first_name last_name')
            .limit(50);

        return enquiries;
    } catch (error) {
        throw new Error(`Failed to get follow-up enquiries: ${error}`);
    }
};