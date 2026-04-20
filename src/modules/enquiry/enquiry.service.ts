import { Enquiry, IEnquiry, StatusType, Priority, IStatusHistory, IStatusNote } from './enquiry.model';
import {  Types } from 'mongoose';
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

// Create new enquiry with status tracking
export const createEnquiry = async (enquiryData: CreateEnquiryData): Promise<IEnquiry> => {
    try {
        // Generate enquiry number
        const enquiry_no = await generateNextEnquiryNumber();
        const now = new Date();

        // Create initial status history entry
        const initialStatusHistory: IStatusHistory = {
            from_status: undefined,
            to_status: enquiryData.status || 'NEW',
            note: enquiryData.status_note || '',
            changed_by: enquiryData.assigned_employee_id ? new Types.ObjectId(enquiryData.assigned_employee_id) : undefined,
            changed_at: now,
            is_initial: true
        };

        // Create initial status note if exists
        const initialStatusNotes: IStatusNote[] = [];
        if (enquiryData.status_note) {
            initialStatusNotes.push({
                previous_status: undefined,
                current_status: enquiryData.status || 'NEW',
                note: enquiryData.status_note,
                created_by: enquiryData.assigned_employee_id ? new Types.ObjectId(enquiryData.assigned_employee_id) : undefined,
                created_at: now
            });
        }

        const enquiry = new Enquiry({
            enquiry_no,
            enquiry_date: enquiryData.enquiry_date ? new Date(enquiryData.enquiry_date) : new Date(),
            party_id: enquiryData.party_id,
            subject: enquiryData.subject,
            description: enquiryData.description,
            assigned_employee_id: enquiryData.assigned_employee_id,
            assigned_date: enquiryData.assigned_date,
            status: enquiryData.status || 'NEW',
            status_changed_by: enquiryData.assigned_employee_id,
            status_changed_at: now,
            priority: enquiryData.priority || 'MEDIUM',
            source: enquiryData.source || 'OTHER',
            product_id: enquiryData.product_id,
            status_history: [initialStatusHistory],
            status_notes: initialStatusNotes
        });

        // Add closed_result or cancelled_reason if status requires it
        if (enquiryData.status === 'CLOSED' && enquiryData.closed_result) {
            enquiry.closed_result = enquiryData.closed_result;
        }

        if (enquiryData.status === 'CANCELLED' && enquiryData.cancelled_reason) {
            enquiry.cancelled_reason = enquiryData.cancelled_reason;
        }

        const savedEnquiry = await enquiry.save();
        return savedEnquiry;
    } catch (error) {
        throw new Error(`Failed to create enquiry: ${error}`);
    }
};

// Update enquiry with status tracking
export const updateEnquiry = async (id: string, updateData: UpdateEnquiryData, userId?: string): Promise<IEnquiry | null> => {
    try {
        if (!Types.ObjectId.isValid(id)) {
            throw new Error('Invalid enquiry ID');
        }

        const existingEnquiry = await Enquiry.findById(id);
        if (!existingEnquiry) {
            throw new Error('Enquiry not found');
        }

        // Handle status-specific validations
        if (updateData.status === 'CLOSED' && !updateData.closed_result) {
            throw new Error('Closed result is required when status is CLOSED');
        }

        if (updateData.status === 'CANCELLED' && !updateData.cancelled_reason) {
            throw new Error('Cancellation reason is required when status is CANCELLED');
        }

        // Prepare update object
        const updateObj: any = { ...updateData };
        const now = new Date();

        // Track status changes
        if (updateData.status && updateData.status !== existingEnquiry.status) {
            // Create status history entry
            const statusHistoryEntry: IStatusHistory = {
                from_status: existingEnquiry.status,
                to_status: updateData.status,
                note: updateData.status_note || '',
                changed_by: userId ? new Types.ObjectId(userId) : existingEnquiry.assigned_employee_id,
                changed_at: now,
                is_initial: false
            };

            // Create status note entry if note exists
            let statusNoteEntry: IStatusNote | null = null;
            if (updateData.status_note) {
                statusNoteEntry = {
                    previous_status: existingEnquiry.status,
                    current_status: updateData.status,
                    note: updateData.status_note,
                    created_by: userId ? new Types.ObjectId(userId) : existingEnquiry.assigned_employee_id,
                    created_at: now
                };
            }

            // Use findByIdAndUpdate with $push to add to arrays
            const updateQuery: any = {
                $set: {
                    status: updateData.status,
                    status_changed_at: now,
                    status_changed_by: userId ? new Types.ObjectId(userId) : existingEnquiry.assigned_employee_id,
                    ...(updateData.status_note && { status_note: updateData.status_note }),
                    updatedAt: now
                },
                $push: {
                    status_history: statusHistoryEntry
                }
            };

            // Add status note if exists
            if (statusNoteEntry) {
                updateQuery.$push.status_notes = statusNoteEntry;
            }

            // Remove status_note from $set if it's being pushed to status_notes
            if (updateData.status_note) {
                delete updateQuery.$set.status_note;
            }

            const updatedEnquiry = await Enquiry.findByIdAndUpdate(
                id,
                updateQuery,
                { new: true, runValidators: true }
            )
                .populate('party', 'partyName nickName contact')
                .populate('assigned_employee', 'first_name last_name')
                .populate('status_changed_by_employee', 'first_name last_name')
                .populate('products', 'name partNo');

            return updatedEnquiry;
        } else {
            // If status is not changing, just update other fields
            updateObj.updatedAt = now;

            const updatedEnquiry = await Enquiry.findByIdAndUpdate(
                id,
                updateObj,
                { new: true, runValidators: true }
            )
                .populate('party', 'partyName nickName contact')
                .populate('assigned_employee', 'first_name last_name')
                .populate('status_changed_by_employee', 'first_name last_name')
                .populate('products', 'name partNo');

            return updatedEnquiry;
        }
    } catch (error) {
        throw new Error(`Failed to update enquiry: ${error}`);
    }
};

// Get enquiry by ID with all details
export const getEnquiryById = async (id: string): Promise<IEnquiry | null> => {
    try {
        if (!Types.ObjectId.isValid(id)) {
            throw new Error('Invalid enquiry ID');
        }

        const enquiry = await Enquiry.findById(id)
            .populate('party', 'partyName nickName contact location entityCategory')
            .populate('assigned_employee', 'first_name last_name contact email')
            .populate('status_changed_by_employee', 'first_name last_name')
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
            limit = 1000000
        } = filters;

        const query: any = {};

        // Search across multiple fields
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { enquiry_no: searchRegex },
                { status: searchRegex },
                { subject: searchRegex },
                { priority: searchRegex },
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

// Add status note to enquiry
export const addStatusNote = async (
    enquiryId: string, 
    note: string, 
    userId?: string
): Promise<IEnquiry | null> => {
    try {
        if (!Types.ObjectId.isValid(enquiryId)) {
            throw new Error('Invalid enquiry ID');
        }

        const enquiry = await Enquiry.findById(enquiryId);
        if (!enquiry) {
            throw new Error('Enquiry not found');
        }

        const statusNote = {
            previous_status: enquiry.status_history.length > 0 
                ? enquiry.status_history[enquiry.status_history.length - 1]?.to_status 
                : undefined,
            current_status: enquiry.status,
            note,
            created_by: userId ? new Types.ObjectId(userId) : enquiry.assigned_employee_id,
            created_at: new Date()
        };

        enquiry.status_notes.push(statusNote);
        await enquiry.save();

        return await getEnquiryById(enquiryId);
    } catch (error) {
        throw new Error(`Failed to add status note: ${error}`);
    }
};

// Get enquiry status history
export const getEnquiryStatusHistory = async (enquiryId: string): Promise<any> => {
    try {
        if (!Types.ObjectId.isValid(enquiryId)) {
            throw new Error('Invalid enquiry ID');
        }

        const enquiry = await Enquiry.findById(enquiryId)
            .populate({
                path: 'status_history.changed_by',
                select: 'first_name last_name'
            })
            .select('status_history enquiry_no subject');

        if (!enquiry) {
            throw new Error('Enquiry not found');
        }

        return {
            enquiry_no: enquiry.enquiry_no,
            subject: enquiry.subject,
            status_history: enquiry.status_history
        };
    } catch (error) {
        throw new Error(`Failed to get status history: ${error}`);
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