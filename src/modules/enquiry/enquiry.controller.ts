import { Request, Response } from 'express';
import {
  createEnquiry,
  getEnquiryById,
  updateEnquiry,
  getAllEnquiries,
  deleteEnquiry,
  getEnquiryStatistics,
  convertEnquiry,
  getFollowUpEnquiries,
  getEnquiryStatusHistory,
  addStatusNote,
} from './enquiry.service';
import { CreateEnquiryData, FilterOptions, UpdateEnquiryData } from './types';

export const createEnquiryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const enquiryData: CreateEnquiryData = req.body;
        const userId = (req as any).user?._id; // Assuming you have user authentication
        
        // Validate required fields
        if (!enquiryData.subject) {
            res.status(400).json({ success: false, message: 'Subject is required' });
            return;
        }

        if (!enquiryData.description) {
            res.status(400).json({ success: false, message: 'Description is required' });
            return;
        }

        // Validate status-specific fields
        if (enquiryData.status === 'CLOSED' && !enquiryData.closed_result) {
            res.status(400).json({ success: false, message: 'Closed result is required when status is CLOSED' });
            return;
        }

        if (enquiryData.status === 'CANCELLED' && !enquiryData.cancelled_reason) {
            res.status(400).json({ success: false, message: 'Cancellation reason is required when status is CANCELLED' });
            return;
        }

        const enquiry = await createEnquiry(enquiryData);
        
        res.status(201).json({
            success: true,
            message: 'Enquiry created successfully',
            data: enquiry
        });
    } catch (error: any) {
        console.error('Create enquiry error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create enquiry'
        });
    }
};

export const getEnquiryByIdController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const enquiry = await getEnquiryById(id as string);

        if (!enquiry) {
            res.status(404).json({
                success: false,
                message: 'Enquiry not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: enquiry
        });
    } catch (error: any) {
        console.error('Get enquiry by ID error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get enquiry'
        });
    }
};

// Get all enquiries with filters
export const getAllEnquiriesController = async (req: Request, res: Response): Promise<void> => {
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
      page = '1',
      limit = '10'
    } = req.query;

    const filterOptions: FilterOptions = {
      search: search as string,
      status: status as any,
      priority: priority as any,
      source: source as any,
      party_id: party_id as string,
      assigned_employee_id: assigned_employee_id as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await getAllEnquiries(filterOptions);
    
    res.status(200).json({
      success: true,
      message: 'Enquiries retrieved successfully',
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  } catch (error: any) {
    console.error('Get all enquiries error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get enquiries'
    });
  }
};

export const updateEnquiryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const updateData: UpdateEnquiryData = req.body;
        const userId = (req as any).user?._id; // Assuming you have user authentication

        const updatedEnquiry = await updateEnquiry(id as string, updateData, userId);
        
        if (!updatedEnquiry) {
            res.status(404).json({
                success: false,
                message: 'Enquiry not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Enquiry updated successfully',
            data: updatedEnquiry
        });
    } catch (error: any) {
        console.error('Update enquiry error:', error);
        
        if (error.message.includes('required') || error.message.includes('must be assigned')) {
            res.status(400).json({
                success: false,
                message: error.message
            });
            return;
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update enquiry'
        });
    }
};

// Delete enquiry
export const deleteEnquiryController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await deleteEnquiry(id as string);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete enquiry error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete enquiry'
    });
  }
};

// Get enquiry statistics
export const getEnquiryStatisticsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const statistics = await getEnquiryStatistics();
    
    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error: any) {
    console.error('Get enquiry statistics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get enquiry statistics'
    });
  }
};

// Convert enquiry to quotation/sales order
export const convertEnquiryController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { convertTo, documentId } = req.body;

    if (!convertTo || !documentId) {
      res.status(400).json({
        success: false,
        message: 'convertTo and documentId are required'
      });
      return;
    }

    if (!['QUOTATION', 'SALES_ORDER'].includes(convertTo)) {
      res.status(400).json({
        success: false,
        message: 'convertTo must be either QUOTATION or SALES_ORDER'
      });
      return;
    }

    const convertedEnquiry = await convertEnquiry(id as string, convertTo, documentId);
    
    if (!convertedEnquiry) {
      res.status(404).json({
        success: false,
        message: 'Enquiry not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Enquiry converted to ${convertTo} successfully`,
      data: convertedEnquiry
    });
  } catch (error: any) {
    console.error('Convert enquiry error:', error);
    
    if (error.message.includes('cannot be converted') || error.message.includes('must be assigned')) {
      res.status(400).json({
        success: false,
        message: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to convert enquiry'
    });
  }
};

// Get follow-up enquiries
export const getFollowUpEnquiriesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const followUpEnquiries = await getFollowUpEnquiries();
    
    res.status(200).json({
      success: true,
      data: followUpEnquiries
    });
  } catch (error: any) {
    console.error('Get follow-up enquiries error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get follow-up enquiries'
    });
  }
};

// Add status note controller
export const addStatusNoteController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { note } = req.body;
        const userId = (req as any).user?._id;

        if (!note) {
            res.status(400).json({ success: false, message: 'Note is required' });
            return;
        }

        const updatedEnquiry = await addStatusNote(id as string, note, userId);
        
        if (!updatedEnquiry) {
            res.status(404).json({
                success: false,
                message: 'Enquiry not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Status note added successfully',
            data: updatedEnquiry
        });
    } catch (error: any) {
        console.error('Add status note error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add status note'
        });
    }
};

// Get status history controller
export const getStatusHistoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const statusHistory = await getEnquiryStatusHistory(id as string);
        
        if (!statusHistory) {
            res.status(404).json({
                success: false,
                message: 'Enquiry not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: statusHistory
        });
    } catch (error: any) {
        console.error('Get status history error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get status history'
        });
    }
};