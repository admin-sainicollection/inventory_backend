import { Types } from "mongoose";
import { Reminder } from "./reminder.model"
import { IReminder } from "./types"

export const createReminder = async (reminderData: IReminder) => {
    try {
        const reminder = await Reminder.create(reminderData);
        return reminder;
    } catch (error) {
        throw new Error(`Failed to create ${error}`)
    }
}

export const updateReminder = async (id: string, reminderData: Partial<IReminder>) => {
    try {
        const existingEnquiry = await Reminder.findById(id);
        if (!existingEnquiry) {
            throw new Error('Reminder not found')
        }
        const updatedReminder = await Reminder.findByIdAndUpdate(
            id,
            reminderData,
            { new: true, runValidators: true }
        )
        return updatedReminder
    } catch (error) {
        throw new Error(`Failed to update ${error}`)
    }
}

// services/reminder.service.ts
export const getAllReminder = async (filters: any) => {
    try {
        const { search, status, priority, startDate, endDate, page, limit, overdue } = filters;
        const query: any = {};

        // Search filter
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            query.$or = [
                { description: searchRegex },
                { statusNote: searchRegex }
            ];
        }

        // Status filter
        if (status && status !== 'ALL') {
            query.status = status;
        }

        // Priority filter
        if (priority && priority !== 'ALL') {
            query.priority = priority;
        }

        // Date range filter - using reminderDate field
        if (startDate || endDate) {
            query.reminderDate = {};
            if (startDate) {
                query.reminderDate.$gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.reminderDate.$lte = end;
            }
        }

        // Overdue filter (reminderDate < current date and status not closed)
        if (overdue === 'true') {
            query.reminderDate = { $lt: new Date() };
            query.status = { $ne: 'CLOSED' };
        }

        // Sort and pagination
        const skip = (page - 1) * limit;
        const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
        const sortField = filters.sortBy || 'reminderDate';

        const [reminders, total] = await Promise.all([
            Reminder.find(query)
                .sort({ [sortField]: sortOrder })
                .skip(skip)
                .limit(limit)
                .lean(),
            Reminder.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data: reminders,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages
        };
    } catch (error) {
        throw new Error(`Failed to get reminders: ${error}`);
    }
};

export const getReminderById = async (id: string) => {
    try {
        // Validate ObjectId
        if (!Types.ObjectId.isValid(id)) {
            throw new Error('Invalid reminder ID format');
        }

        const reminder = await Reminder.findById(id);
        return reminder;
    } catch (error) {
        throw new Error(`Failed to fetch reminder: ${error}`);
    }
};

export const getReminderByDate = async () => {
    try {
        // Get start and end of today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const reminder = await Reminder.find({
            $or: [
                {
                    reminderDate: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                },
                {
                    nextReminderDate: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                }
            ]
        });

        return reminder;
    } catch (error) {
        throw new Error(`Failed to fetch reminder for today: ${error}`);
    }
};

export const deleteReminder = async (id: string) => {
    try {
        if (!Types.ObjectId.isValid(id)) {
            throw new Error('Reminder Id is required')
        }
        const deletedReminder = await Reminder.findByIdAndDelete(id);
        return deletedReminder;
    } catch (error) {
        throw new Error(`Failed to delete reminder ${error}`)
    }
}
