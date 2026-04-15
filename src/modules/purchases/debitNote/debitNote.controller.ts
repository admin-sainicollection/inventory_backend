import { Request, Response } from "express";
import { FilterOptions, GstType } from "../types";
import { createDebitNote, deleteDebitNote, getAllDebitNote, getNextDebitNoteNumber, getDebitNoteById, updateDebitNote } from "./debitNote.service";

export const createDebitNoteController = async (req: Request, res: Response) => {
    try {
        const debitNote = await createDebitNote(req.body);
        res.status(200).json({
            success: true,
            message: "Debit Note Created Successfully!",
            data: debitNote
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Updated controller
export const getAllDebitNoteController = async (req: Request, res: Response) => {
    try {
        const { gstType, limit = 50, page = 1, search, status, startDate, endDate, dateRange, partyId, vendorId } = req.query;

        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 50;

        const filterOptions: FilterOptions = {
            gstType: gstType as GstType,
            search: search as string,
            status: status as string,
            dateRange: dateRange as string,
            startDate: startDate as string,
            endDate: endDate as string,
            page: pageNum,
            limit: limitNum,
            partyId: partyId as string,
            vendorId: vendorId as string
        }

        const result = await getAllDebitNote(filterOptions);

        res.status(200).json({
            success: true,
            message: 'Debit Note retrieved successfully',
            data: result.data,
            pagination: {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPage: result.totalPage
            }
        });

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Get next invoice number - This just shows what the next number would be
export const getNextDebitNoteNumberController = async (req: Request, res: Response) => {
    try {
        const { debitNoteType, gstType } = req.query;
        const nextNumber = await getNextDebitNoteNumber(debitNoteType as string || "DEBIT_NOTE", gstType as GstType || "GST");

        res.json({
            success: true,
            message: "Next Debit Note number calculated from last Debit Notes",
            debitNoteNumber: nextNumber
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

// Get invoice by ID
export const getDebitNoteByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const debitNote = await getDebitNoteById(id as string);

        res.status(200).json({
            success: true,
            message: "Debit Note retrieved successfully",
            data: debitNote
        });
    } catch (error: any) {
        res.status(404).json({
            success: false,
            message: error.message
        })
    }
};

// Update invoice
export const updateDebitNoteController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const debitNote = await updateDebitNote(id as string, req.body);

        res.status(200).json({
            success: true,
            message: "Debit Note updated successfully",
            data: debitNote
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

// Delete invoice
export const deleteDebitNoteController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const debitNote = await deleteDebitNote(id as string);

        res.status(200).json({
            success: true,
            message: "Debit Note deleted successfully",
            data: debitNote
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};