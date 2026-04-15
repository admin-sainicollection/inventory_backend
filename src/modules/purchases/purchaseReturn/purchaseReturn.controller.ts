import { Request, Response } from "express";
import { FilterOptions, GstType } from "../types";
import { createPurchaseReturn, deletePurchaseReturn, getAllPurchaseReturn, getNextPurchaseReturnNumber, getPurchaseReturnById, updatePurchaseReturn } from "./purchaseReturn.service";

export const createPurchaseReturnController = async (req: Request, res: Response) => {
    try {
        const purchaseReturn = await createPurchaseReturn(req.body);
        res.status(200).json({
            success: true,
            message: "Purchase Return Created Successfully!",
            data: purchaseReturn
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Updated controller
export const getAllPurchaseReturnController = async (req: Request, res: Response) => {
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

        const result = await getAllPurchaseReturn(filterOptions);

        res.status(200).json({
            success: true,
            message: 'Purchase Return retrieved successfully',
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
export const getNextPurchaseReturnNumberController = async (req: Request, res: Response) => {
    try {
        const { purchaseReturnType, gstType } = req.query;
        const nextNumber = await getNextPurchaseReturnNumber(purchaseReturnType as string || "PURCHASE_RETURN", gstType as GstType || "GST");

        res.json({
            success: true,
            message: "Next purchase return number calculated from last purchase returns",
            purchaseReturnNumber: nextNumber
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

// Get invoice by ID
export const getPurchaseReturnByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const purchaseReturn = await getPurchaseReturnById(id as string);

        res.status(200).json({
            success: true,
            message: "Purchase Return retrieved successfully",
            data: purchaseReturn
        });
    } catch (error: any) {
        res.status(404).json({
            success: false,
            message: error.message
        })
    }
};

// Update invoice
export const updatePurchaseReturnController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const purchaseReturn = await updatePurchaseReturn(id as string, req.body);

        res.status(200).json({
            success: true,
            message: "Purchase Return updated successfully",
            data: purchaseReturn
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

// Delete invoice
export const deletePurchaseReturnController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const purchaseReturn = await deletePurchaseReturn(id as string);

        res.status(200).json({
            success: true,
            message: "Purchase return deleted successfully",
            data: purchaseReturn
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};