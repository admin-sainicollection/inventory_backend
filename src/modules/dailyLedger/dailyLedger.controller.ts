import { Request, Response } from 'express';
import { IDailyLedger } from './dailyLedger.model';
import {
    createDailyLedger,
    getLedgerByPartyId,
    getLedgerById,
    updateDailyLedger,
    deleteDailyLedger,
    getAllLedgers,
    getLedgerSummary,
} from './dailyLedger.service';

// Add new ledger entry
export const addLedger = async (req: Request, res: Response) => {
    try {
        const ledgerData: IDailyLedger = req.body;

        const newLedger = await createDailyLedger(ledgerData);

        res.status(201).json({
            success: true,
            message: 'Ledger entry created successfully',
            data: newLedger
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create ledger entry',
            error: error.message
        });
    }
};

// Edit ledger entry
export const editLedger = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData: IDailyLedger = req.body;

        const updatedLedger = await updateDailyLedger(id as string, updateData);

        if (!updatedLedger) {
            return res.status(404).json({
                success: false,
                message: 'Ledger entry not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Ledger entry updated successfully',
            data: updatedLedger
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update ledger entry',
            error: error.message
        });
    }
};

// Delete ledger entry
export const deleteLedger = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const deletedLedger = await deleteDailyLedger(id as string);

        if (!deletedLedger) {
            return res.status(404).json({
                success: false,
                message: 'Ledger entry not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Ledger entry deleted successfully',
            data: deletedLedger
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to delete ledger entry',
            error: error.message
        });
    }
};

// Get ledger by partyId with enhanced search
export const getLedgerByPartyIdController = async (req: Request, res: Response) => {
    try {
        const { partyId } = req.params;
        const { search } = req.query;

        const searchText = search as string | undefined;

        const ledgers = await getLedgerByPartyId(partyId as string, searchText);

        res.status(200).json({
            success: true,
            message: 'Ledger entries retrieved successfully',
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
export const getAllLedgersController = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const searchText = search as string | undefined;

        const ledgers = await getAllLedgers(searchText);

        res.status(200).json({
            success: true,
            message: 'All ledger entries retrieved successfully',
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

// Get single ledger entry by ID
export const getLedgerByIdController = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const ledger = await getLedgerById(id as string);

        if (!ledger) {
            return res.status(404).json({
                success: false,
                message: 'Ledger entry not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Ledger entry retrieved successfully',
            data: ledger
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to retrieve ledger entry',
            error: error.message
        });
    }
};

// Get ledger summary for a party
export const getPartyLedgerSummary = async (req: Request, res: Response) => {
    try {
        const { partyId } = req.params;

        const summary = await getLedgerSummary(partyId as string);

        res.status(200).json({
            success: true,
            message: 'Ledger summary retrieved successfully',
            data: summary
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to retrieve ledger summary',
            error: error.message
        });
    }
};