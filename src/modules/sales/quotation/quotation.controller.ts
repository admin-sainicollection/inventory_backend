import { Request, Response } from "express";
import { createQuotation, deleteQuotation, getAllQuotation, getNextQuotationNumber, getQuotationById, updateQuotation } from "./quotation.service";
import { FilterOptions, GstType } from "../types";

export const createQuotationController = async (req: Request, res: Response) => {
    try {
        const quotation = await createQuotation(req.body);
        res.status(200).json({
            success: true,
            message: "Quotation Created Successfully!",
            data: quotation
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const getNextQuotationNumberController = async (req: Request, res: Response) => {
    try {
        const { invoiceType, gstType } = req.query;
        const nextNumber = await getNextQuotationNumber(invoiceType as string || "QUOTATION", gstType as GstType || "GST");

        res.json({
            success: true,
            message: "Next quotation number calculated from last invoice",
            quotationNumber: nextNumber
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};


export const getAllQuotationController = async (req: Request, res: Response) => {
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

        const result = await getAllQuotation(filterOptions);

        res.status(200).json({
            success: true,
            message: 'Quotations retrieved successfully',
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

export const getQuotationByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const quotation = await getQuotationById(id as string);

        res.status(200).json({
            success: true,
            message: "Quotation retrieved successfully",
            data: quotation
        });
    } catch (error: any) {
        res.status(404).json({
            success: false,
            message: error.message
        })
    }
};

export const updateQuotationController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const quotation = await updateQuotation(id as string, req.body);

        res.status(200).json({
            success: true,
            message: "Quotation updated successfully",
            data: quotation
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

export const deleteQuotationController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const quotation = await deleteQuotation(id as string);

        res.status(200).json({
            success: true,
            message: "Quotation deleted successfully",
            data: quotation
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};