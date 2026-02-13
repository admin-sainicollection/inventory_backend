// salesInvoice.controller.ts
import { Request, Response } from "express";
import { FilterOptions, GstType } from "../types";
import { createSalesReturn, deleteSalesReturn, getAllSalesReturn, getNextSalesReturnNumber, getSalesReturnById, updateSalesReturn } from "./salesReturn.service";

export const createSalesReturnController = async (req: Request, res: Response) => {
    try {
        const salesReturn = await createSalesReturn(req.body);
        res.status(200).json({
            success: true,
            message: "Sales Return Created Successfully!",
            data: salesReturn
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Updated controller
export const getAllSalesReturnController = async (req: Request, res: Response) => {
    try {
        const { gstType, limit = 50, page = 1, search, status, startDate, endDate, dateRange } = req.query;

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
            limit: limitNum
        }

        const result = await getAllSalesReturn(filterOptions);

        res.status(200).json({
            success: true,
            message: 'Sales Return retrieved successfully',
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
export const getNextSalesReturnNumberController = async (req: Request, res: Response) => {
    try {
        const { salesReturnType, gstType } = req.query;
        const nextNumber = await getNextSalesReturnNumber(salesReturnType as string || "SALES_RETURN", gstType as GstType || "GST");

        res.json({
            success: true,
            message: "Next sales return number calculated from last sales returns",
            salesReturnNumber: nextNumber
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

// Get invoice by ID
export const getSalesReturnByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const salesReturn = await getSalesReturnById(id as string);

        res.status(200).json({
            success: true,
            message: "Sales Return retrieved successfully",
            data: salesReturn
        });
    } catch (error: any) {
        res.status(404).json({
            success: false,
            message: error.message
        })
    }
};

// Update invoice
export const updateSalesReturnController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const salesReturn = await updateSalesReturn(id as string, req.body);

        res.status(200).json({
            success: true,
            message: "Sales Return updated successfully",
            data: salesReturn
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

// Delete invoice
export const deleteSalesReturnController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const salesReturn = await deleteSalesReturn(id as string);

        res.status(200).json({
            success: true,
            message: "Sales return deleted successfully",
            data: salesReturn
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};