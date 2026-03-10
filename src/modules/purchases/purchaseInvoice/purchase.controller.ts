// salesInvoice.controller.ts
import { Request, Response } from "express";
import { FilterOptions, GstType } from "../types";
import { createPurchaseInvoice, deletePurchaseInvoice, getAllPurchaseInvoice, getNextPurchaseNumber, getPurchaseInvoiceById, updatePurchaseInvoice } from "./purchaseInvoice.service";

export const createPurchaseInvoiceController = async (req: Request, res: Response) => {
    try {
        const purchase = await createPurchaseInvoice(req.body);
        res.status(200).json({
            success: true,
            message: "Purchase Created Successfully!",
            data: purchase
        })
    } catch (errors: any) {
        res.status(500).json({
            success: false,
            message: errors.message
        })
    }
}

// Updated controller
export const getAllPurchaseController = async (req: Request, res: Response) => {
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

        const result = await getAllPurchaseInvoice(filterOptions);

        res.status(200).json({
            success: true,
            message: 'Purchase retrieved successfully',
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
export const getNextPurchaseNumberController = async (req: Request, res: Response) => {
    try {
        const { purchaseType, gstType } = req.query;
        const nextNumber = await getNextPurchaseNumber(purchaseType as string || "PURCHASE", gstType as GstType || "GST");

        res.json({
            success: true,
            message: "Next purchase number calculated from last purchase",
            purchaseNumber: nextNumber
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

// Get invoice by ID
export const getPurchaseInvoiceByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const purchase = await getPurchaseInvoiceById(id as string);

        res.status(200).json({
            success: true,
            message: "Purchase retrieved successfully",
            data: purchase
        });
    } catch (error: any) {
        res.status(404).json({
            success: false,
            message: error.message
        })
    }
};

// Update invoice
export const updatePurchaseInvoiceController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const purchase = await updatePurchaseInvoice(id as string, req.body);

        res.status(200).json({
            success: true,
            message: "Purchase updated successfully",
            data: purchase
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

// Delete invoice
export const deletePurchaseInvoiceController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const purchase = await deletePurchaseInvoice(id as string);

        res.status(200).json({
            success: true,
            message: "Purchase deleted successfully",
            data: purchase
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};