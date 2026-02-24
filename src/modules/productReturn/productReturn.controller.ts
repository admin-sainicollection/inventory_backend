import { Request, Response } from "express";
import { addStatusNote, createProductReturn, deleteProductReturn, getAllProductReturn, getNextProductReturnNumber, getProductNoteStatusHistory, getProductReturnById, updateProductReturn } from "./productReturn.service";
import { FilterOptions } from "./types";

export const createProductReturnController = async (req: Request, res: Response) => {
    try {
        const productReturn = await createProductReturn(req.body);
        res.status(200).json({
            success: true,
            message: "Product Return Created Successfully!",
            data: productReturn
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}


export const updateProductReturnController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const ProductReturn = await updateProductReturn(id as string, req.body);

        res.status(200).json({
            success: true,
            message: "Product Return updated successfully",
            data: ProductReturn
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};


export const getAllProductReturnController = async (req: Request, res: Response) => {
    try {
        const { limit = 50, page = 1, search, status, startDate, endDate, dateRange, partyId, vendorId } = req.query;

        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 50;

        const filterOptions: FilterOptions = {
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

        const result = await getAllProductReturn(filterOptions);

        res.status(200).json({
            success: true,
            message: 'Product Return retrieved successfully',
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


export const getNextProductReturnNumberController = async (req: Request, res: Response) => {
    try {
        const nextNumber = await getNextProductReturnNumber();

        res.json({
            success: true,
            message: "Next product return number calculated from last product returns",
            productReturnNumber: nextNumber
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};


export const getProductReturnByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const productReturn = await getProductReturnById(id as string);

        res.status(200).json({
            success: true,
            message: "Product Return retrieved successfully",
            data: productReturn
        });
    } catch (error: any) {
        res.status(404).json({
            success: false,
            message: error.message
        })
    }
};


export const deleteProductReturnController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const productReturn = await deleteProductReturn(id as string);

        res.status(200).json({
            success: true,
            message: "Product return deleted successfully",
            data: productReturn
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
};


export const addStatusNoteController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { note } = req.body;

        if (!note) {
            res.status(400).json({ success: false, message: 'Note is required' });
            return;
        }

        const updatedProductReturn = await addStatusNote(id as string, note);

        if (!updatedProductReturn) {
            res.status(404).json({
                success: false,
                message: 'Product return not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Status note added successfully',
            data: updatedProductReturn
        });
    } catch (error: any) {
        console.error('Add status note error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add status note'
        });
    }
};


export const getStatusHistoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const statusHistory = await getProductNoteStatusHistory(id as string);

        if (!statusHistory) {
            res.status(404).json({
                success: false,
                message: 'Product not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: statusHistory
        });
    } catch (error: any) {
        console.error('Get status history error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to get status history'
        });
    }
};