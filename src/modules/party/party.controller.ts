import { Request, Response } from 'express';
import * as PartyService from './party.service';

export const addParty = async (req: Request, res: Response) => {
    try {
        const party = await PartyService.createParty(req.body);
        res.status(201).json({
            status: "success",
            message: "Party created successfully",
            party
        });
    } catch (error: any) {
        if (error.message.includes("already exists")) {
            return res.status(409).json({
                status: "error",
                message: error.message
            });
        }
        res.status(500).json({ status: "error", message: error.message });
    }
}

export const updateParty = async (req: Request, res: Response) => {
    try {
        const party = await PartyService.updateParty(req.params.id as string, req.body);
        res.status(200).json({
            status: "success",
            message: "Party updated successfully!",
            party: party
        });
    } catch (error: any) {
        if (error.message.includes("not found")) {
            return res.status(404).json({
                status: "error",
                message: error.message
            });
        }
        if (error.message.includes("already exists")) {
            return res.status(409).json({
                status: "error",
                message: error.message
            });
        }
        res.status(500).json({ status: "error", message: error.message });
    }
}

export const getAllParties = async (req: Request, res: Response) => {
    try {
        const { q, entityCategory, page, limit } = req.query;

        // Call service with search query and pagination
        const result = await PartyService.getAllParties(
            q ? String(q) : undefined,
            entityCategory ? String(entityCategory) : undefined,
            page ? Number(page) : undefined,
            limit ? Number(limit) : undefined
        );

        res.status(200).json({
            status: "success",
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
            parties: result.parties
        });
    } catch (error: any) {
        if (error.message.includes("not found")) {
            return res.status(404).json({
                status: "error",
                message: error.message
            });
        }
        res.status(500).json({ status: "error", message: error.message });
    }
}

export const getPartyById = async (req: Request, res: Response) => {
    try {
        const party = await PartyService.getPartyById(req.params.id as string);
        res.status(200).json({
            status: "success",
            party: party
        });
    } catch (error: any) {
        if (error.message.includes("not found")) {
            return res.status(404).json({
                status: "error",
                message: error.message
            });
        }
        res.status(500).json({ status: "error", message: error.message });
    }
}

export const deleteParty = async (req: Request, res: Response) => {
    try {
        const party = await PartyService.deleteParty(req.params.id as string);
        res.status(200).json({
            status: "success",
            message: "Party deleted successfully!",
            party
        });
    } catch (error: any) {
        if (error.message.includes("not found")) {
            return res.status(404).json({
                status: "error",
                message: error.message
            });
        }
        res.status(500).json({ status: "error", message: error.message });
    }
}

// Phone Management Controllers
export const addPhoneToParty = async (req: Request, res: Response) => {
    try {
        const { partyId } = req.params;
        const { label, phoneNo } = req.body;

        if (!label || !phoneNo) {
            return res.status(400).json({
                status: "error",
                message: "Label and phone number are required"
            });
        }

        const party = await PartyService.addPhoneToParty(partyId as string, { label, phoneNo });
        res.status(200).json({
            status: "success",
            message: "Phone number added successfully",
            party
        });
    } catch (error: any) {
        if (error.message.includes("not found")) {
            return res.status(404).json({
                status: "error",
                message: error.message
            });
        }
        res.status(500).json({ status: "error", message: error.message });
    }
}

export const removePhoneFromParty = async (req: Request, res: Response) => {
    try {
        const { partyId, phoneIndex } = req.params;

        const party = await PartyService.removePhoneFromParty(partyId as string, parseInt(phoneIndex as string));
        res.status(200).json({
            status: "success",
            message: "Phone number removed successfully",
            party
        });
    } catch (error: any) {
        if (error.message.includes("not found")) {
            return res.status(404).json({
                status: "error",
                message: error.message
            });
        }
        res.status(500).json({ status: "error", message: error.message });
    }
}

// Email Management Controllers
export const addEmailToParty = async (req: Request, res: Response) => {
    try {
        const { partyId } = req.params;
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: "error",
                message: "Email is required"
            });
        }

        const party = await PartyService.addEmailToParty(partyId as string, email);
        res.status(200).json({
            status: "success",
            message: "Email added successfully",
            party
        });
    } catch (error: any) {
        if (error.message.includes("not found")) {
            return res.status(404).json({
                status: "error",
                message: error.message
            });
        }
        res.status(500).json({ status: "error", message: error.message });
    }
}

export const removeEmailFromParty = async (req: Request, res: Response) => {
    try {
        const { partyId, emailIndex } = req.params;

        const party = await PartyService.removeEmailFromParty(partyId as string, parseInt(emailIndex as string));
        res.status(200).json({
            status: "success",
            message: "Email removed successfully",
            party
        });
    } catch (error: any) {
        if (error.message.includes("not found")) {
            return res.status(404).json({
                status: "error",
                message: error.message
            });
        }
        res.status(500).json({ status: "error", message: error.message });
    }
}