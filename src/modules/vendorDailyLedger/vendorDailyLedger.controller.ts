import { Request, Response } from 'express';
import { IVendorDailyLedger } from './vendorDailyLedger.model';
import {
    createVendorDailyLedger,
    getVendorLedgerByVendorId,
    getVendorLedgerById,
    updateVendorDailyLedger,
    deleteVendorDailyLedger,
    getAllVendorLedgers,
    getVendorLedgerSummary,
} from './vendorDailyLedger.service';

// Add new ledger entry
export const addVendorLedger = async (req: Request, res: Response) => {
    try {
        const ledgerData: IVendorDailyLedger = req.body;

        const newLedger = await createVendorDailyLedger(ledgerData);

        res.status(201).json({
            success: true,
            message: 'Vendor Ledger entry created successfully',
            data: newLedger
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create vendor ledger entry',
            error: error.message
        });
    }
};

// Edit ledger entry
export const editVendorLedger = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData: IVendorDailyLedger = req.body;

        const updatedLedger = await updateVendorDailyLedger(id as string, updateData);

        if (!updatedLedger) {
            return res.status(404).json({
                success: false,
                message: 'Vendor Ledger entry not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Vendor Ledger entry updated successfully',
            data: updatedLedger
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update Vendor ledger entry',
            error: error.message
        });
    }
};

// Delete ledger entry
export const deleteVendorLedger = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const deletedLedger = await deleteVendorDailyLedger(id as string);

        if (!deletedLedger) {
            return res.status(404).json({
                success: false,
                message: 'Vendor Ledger entry not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Vendor Ledger entry deleted successfully',
            data: deletedLedger
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to delete Vendor ledger entry',
            error: error.message
        });
    }
};

// Get ledger by vendorId with enhanced search
export const getVendorLedgerByVendorIdController = async (req: Request, res: Response) => {
    try {
        const { vendorId } = req.params;
        const { search } = req.query;

        const searchText = search as string | undefined;

        const ledgers = await getVendorLedgerByVendorId(vendorId as string, searchText);

        res.status(200).json({
            success: true,
            message: 'Vendor Ledger entries retrieved successfully',
            data: ledgers,
            count: ledgers.length
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to retrieve ledger entries',
            error: error.message
        });
    }
};

// Get all ledgers with enhanced search
export const getAllVendorLedgersController = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const searchText = search as string | undefined;

        const ledgers = await getAllVendorLedgers(searchText);

        res.status(200).json({
            success: true,
            message: 'All Vendor ledger entries retrieved successfully',
            data: ledgers,
            count: ledgers.length
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to retrieve Vendor ledger entries',
            error: error.message
        });
    }
};

// Get single ledger entry by ID
export const getVendorLedgerByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const ledger = await getVendorLedgerById(id as string);

        if (!ledger) {
            return res.status(404).json({
                success: false,
                message: 'Vendor Ledger entry not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Vendor Ledger entry retrieved successfully',
            data: ledger
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to retrieve Vendor ledger entry',
            error: error.message
        });
    }
};

// Get ledger summary for a vendor
export const getVendorLedgerSummaryController = async (req: Request, res: Response) => {
    try {
        const { vendorId } = req.params;

        const summary = await getVendorLedgerSummary(vendorId as string);

        res.status(200).json({
            success: true,
            message: 'Vendor Ledger summary retrieved successfully',
            data: summary
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to retrieve Vendor ledger summary',
            error: error.message
        });
    }
};