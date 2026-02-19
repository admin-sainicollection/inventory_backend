// salesInvoice.controller.ts
import { Request, Response } from "express";
import {
    createSalesInvoice,
    getAllSalesInvoice,
    getNextInvoiceNumber,
    getSalesInvoiceById,
    updateSalesInvoice,
    deleteSalesInvoice
} from "./salesInvoice.service";
import { FilterOptions, GstType } from "../types";

export const createSalesInvoiceController = async (req: Request, res: Response) => {
    try {
        const invoice = await createSalesInvoice(req.body);
        res.status(200).json({
            success: true,
            message: "Invoice Created Successfully!",
            data: invoice
        })
    } catch (errors: any) {
        res.status(500).json({
            success: false,
            message: errors.message
        })
    }
}

// Updated controller
export const getAllInvoiceController = async (req: Request, res: Response) => {
    try {
        const { gstType, limit = 50, page = 1, search, status, startDate, endDate, dateRange, partyId } = req.query;

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
            partyId: partyId as string
        }

        const result = await getAllSalesInvoice(filterOptions);

        res.status(200).json({
            success: true,
            message: 'Invoices retrieved successfully',
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
            success: false, // Changed from status to success
            message: error.message
        })
    }
}

// Get next invoice number - This just shows what the next number would be
export const getNextInvoiceNumberController = async (req: Request, res: Response) => {
    try {
        const { invoiceType, gstType } = req.query;
        const nextNumber = await getNextInvoiceNumber(invoiceType as string || "INVOICE", gstType as GstType || "GST");

        res.json({
            success: true,
            message: "Next invoice number calculated from last invoice",
            invoiceNumber: nextNumber
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

// Get invoice by ID
export const getSalesInvoiceByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const invoice = await getSalesInvoiceById(id as string);

        res.status(200).json({
            success: true,
            message: "Invoice retrieved successfully",
            data: invoice
        });
    } catch (error: any) {
        res.status(404).json({
            success: false,
            message: error.message
        })
    }
};

// Update invoice
export const updateSalesInvoiceController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const invoice = await updateSalesInvoice(id as string, req.body);

        res.status(200).json({
            success: true,
            message: "Invoice updated successfully",
            data: invoice
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

// Delete invoice
export const deleteSalesInvoiceController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const invoice = await deleteSalesInvoice(id as string);

        res.status(200).json({
            success: true,
            message: "Invoice deleted successfully",
            data: invoice
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};