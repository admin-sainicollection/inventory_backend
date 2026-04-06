// salesInvoice.controller.ts
import { Request, Response } from "express";

import { FilterOptions, GstType } from "../types";
import { createPaymentOut, deletePaymentOut, getAllPaymentOut, getNextPaymentOutNumber, getPaymentOutById, updatePaymentOut } from "./paymentOut.service";

export const createPaymentOutController = async (req: Request, res: Response) => {
    try {
        const paymentOut = await createPaymentOut(req.body);
        res.status(200).json({
            success: true,
            message: "Payment Out Created Successfully!",
            data: paymentOut
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Updated controller
export const getAllPaymentOutController = async (req: Request, res: Response) => {
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

        const result = await getAllPaymentOut(filterOptions);

        res.status(200).json({
            success: true,
            message: 'Payment Out retrieved successfully',
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
export const getNextPaymentOutNumberController = async (req: Request, res: Response) => {
    try {
        const { paymentOutType, gstType } = req.query;
        const nextNumber = await getNextPaymentOutNumber(paymentOutType as string || "PAYMENT_OUT", gstType as GstType || "GST");

        res.json({
            success: true,
            message: "Next payment Out number calculated from last payment Out",
            paymentOutNumber: nextNumber
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

// Get invoice by ID
export const getPaymentOutByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const paymentOut = await getPaymentOutById(id as string);

        res.status(200).json({
            success: true,
            message: "Payment Out retrieved successfully",
            data: paymentOut
        });
    } catch (error: any) {
        res.status(404).json({
            success: false,
            message: error.message
        })
    }
};

// Update invoice
export const updatePaymentOutController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const paymentOut = await updatePaymentOut(id as string, req.body);

        res.status(200).json({
            success: true,
            message: "Payment Out updated successfully",
            data: paymentOut
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

// Delete invoice
export const deletePaymentOutController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const paymentOut = await deletePaymentOut(id as string);

        res.status(200).json({
            success: true,
            message: "Payment Out deleted successfully",
            data: paymentOut
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};