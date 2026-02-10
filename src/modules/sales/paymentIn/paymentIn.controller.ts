// salesInvoice.controller.ts
import { Request, Response } from "express";

import { FilterOptions, GstType } from "../types";
import { createPaymentIn, deletePaymentIn, getAllPaymentIn, getNextPaymentInNumber, getPaymentInById, updatePaymentIn } from "./paymentIn.service";

export const createPaymentInController = async (req: Request, res: Response) => {
    try {
        const paymentIn = await createPaymentIn(req.body);
        res.status(200).json({
            success: true,
            message: "Payment In Created Successfully!",
            data: paymentIn
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// Updated controller
export const getAllPaymentInController = async (req: Request, res: Response) => {
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

        const result = await getAllPaymentIn(filterOptions);

        res.status(200).json({
            success: true,
            message: 'Payment In retrieved successfully',
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
export const getNextPaymentInNumberController = async (req: Request, res: Response) => {
    try {
        const { paymentInType, gstType } = req.query;
        const nextNumber = await getNextPaymentInNumber(paymentInType as string || "PAYMENT_IN", gstType as GstType || "GST");

        res.json({
            success: true,
            message: "Next payment in number calculated from last payment in",
            paymentInNumber: nextNumber
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

// Get invoice by ID
export const getPaymentInByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const paymentIn = await getPaymentInById(id as string);

        res.status(200).json({
            success: true,
            message: "Payment In retrieved successfully",
            data: paymentIn
        });
    } catch (error: any) {
        res.status(404).json({
            success: false,
            message: error.message
        })
    }
};

// Update invoice
export const updatePaymentInController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const paymentIn = await updatePaymentIn(id as string, req.body);

        res.status(200).json({
            success: true,
            message: "Payment In updated successfully",
            data: paymentIn
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

// Delete invoice
export const deletePaymentInController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const paymentIn = await deletePaymentIn(id as string);

        res.status(200).json({
            success: true,
            message: "Payment In deleted successfully",
            data: paymentIn
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};