// salesInvoice.controller.ts
import { Request, Response } from "express";

import { FilterOptions, GstType } from "../types";
import { createCreditNote, deleteCreditNote, getAllCreditNote, getCreditNoteById, getNextCreditNoteNumber, updateCreditNote } from "./creditNote.service";

export const createCreditNoteController = async (req: Request, res: Response) => {
    try {
        const creditNote = await createCreditNote(req.body);
        res.status(200).json({
            success: true,
            message: "Credit Note Created Successfully!",
            data: creditNote
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Updated controller
export const getAllCreditNoteController = async (req: Request, res: Response) => {
    try {
        const { gstType, limit = 50, page = 1, search, status, startDate, endDate, dateRange, partyId, vendorId  } = req.query;

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

        const result = await getAllCreditNote(filterOptions);

        res.status(200).json({
            success: true,
            message: 'Credit Note retrieved successfully',
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
export const getNextCreditNoteNumberController = async (req: Request, res: Response) => {
    try {
        const { creditNoteType, gstType } = req.query;
        const nextNumber = await getNextCreditNoteNumber(creditNoteType as string || "CREDIT_NOTE", gstType as GstType || "GST");

        res.json({
            success: true,
            message: "Next credit note number calculated from last credit note",
            creditNoteNumber: nextNumber
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

// Get invoice by ID
export const getCreditNoteByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const creditNote = await getCreditNoteById(id as string);

        res.status(200).json({
            success: true,
            message: "Credit Note retrieved successfully",
            data: creditNote
        });
    } catch (error: any) {
        res.status(404).json({
            success: false,
            message: error.message
        })
    }
};

// Update invoice
export const updateCreditNoteController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const creditNote = await updateCreditNote(id as string, req.body);

        res.status(200).json({
            success: true,
            message: "Credit Note updated successfully",
            data: creditNote
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

// Delete invoice
export const deleteCreditNoteController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const creditNote = await deleteCreditNote(id as string);

        res.status(200).json({
            success: true,
            message: "Credit Note deleted successfully",
            data: creditNote
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};