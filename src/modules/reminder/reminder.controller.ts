import { Request, Response } from "express"
import { createReminder, deleteReminder, getAllReminder, getReminderByDate, getReminderById, updateReminder } from "./reminder.service"
import { Priority, Status } from "./types"
export const createReminderController = async (req: Request, res: Response) => {
    try {
        const reminder = await createReminder(req.body)
        res.status(200).json({
            success: true,
            message: "Reminder created successfully",
            data: reminder
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create reminder'
        });
    }
}

export const updateReminderController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const updatedReminder = await updateReminder(id as string, updatedData);
        if (!updatedReminder) {
            res.status(400).json({
                success: false,
                message: 'Reminder not found'
            })
            return
        }
        res.status(200).json({
            success: true,
            message: 'Reminder updated successfully',
            data: updatedReminder
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update enquiry'
        });
    }
}


export const getAllReminderController = async (req: Request, res: Response) => {
    try {
        const {
            search,
            status,
            priority,
            startDate,
            endDate,
            page = 1,
            limit = 10,
            sortBy = 'reminderDate',
            sortOrder = 'desc',
            overdue
        } = req.query;

        const filters = {
            search: search as any,
            status: status as string,
            priority: priority as string,
            startDate: startDate as string,
            endDate: endDate as string,
            page: Number(page),
            limit: Number(limit),
            sortBy: sortBy as string,
            sortOrder: sortOrder as string,
            overdue: overdue as string
        };

        const result = await getAllReminder(filters);

        res.status(200).json({
            success: true,
            message: "Reminders fetched successfully!",
            data: result.data,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
        });
    } catch (error: any) {
        console.error('Get reminders error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get reminders'
        });
    }
};

export const getReminderByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Reminder ID is required'
            });
            return;
        }

        const result = await getReminderById(id);

        if (!result) {
            res.status(404).json({
                success: false,
                message: 'Reminder not found'
            });
            return;
        }

        // Fixed: Use 200 status code for success, not 400
        res.status(200).json({
            success: true,
            message: "Reminder fetched successfully!",
            data: result
        });

    } catch (error: any) {
        console.error('Get reminder by ID error:', error);

        // Handle specific error messages
        if (error.message.includes('Invalid reminder ID format')) {
            res.status(400).json({
                success: false,
                message: error.message
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get reminder'
        });
    }
};

export const getReminderByDateController = async (req: Request, res: Response) => {
    try {
        const result = await getReminderByDate();
        if (!result) {
            res.status(400).json({
                success: false,
                message: 'Reminder not found on reminder date'
            })
            return
        }
        res.status(200).json({
            success: true,
            message: 'Reminder fetched on this date',
            data: result
        })
    } catch (error: any) {
        console.error('Get reminder by date error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get reminder by date'
        });
    }
}

export const deleteReminderController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const deleted = await deleteReminder(id as string);

        if (!deleted) {
            res.status(404).json({
                success: false,
                message: 'Reminder not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Reminder deleted successfully'
        });
    } catch (error: any) {
        console.error('Delete reminder error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete reminder'
        });
    }
}