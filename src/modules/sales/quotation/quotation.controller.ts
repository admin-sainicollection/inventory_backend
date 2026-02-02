import { Request, Response } from "express";
import { createQuotation, getNextQuotationNumber } from "./quotation.service";
import { GstType } from "../types";

export const createQuotationController = async (req: Request, res: Response) => {
    try {
        const invoice = await createQuotation(req.body);
        res.status(200).json({
            success: true,
            message: "Quotation Created Successfully!",
            data: invoice
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