import { Request, Response } from 'express';
import * as VendorService from './vendor.service';

export const addVendor = async (req: Request, res: Response) => {
    try {
        const vendor = await VendorService.createVendor(req.body);
        res.status(201).json({ 
            status: "success", 
            message: "Vendor created successfully", 
            vendor 
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

export const updateVendor = async (req: Request, res: Response) => {
    try {
        const vendor = await VendorService.updateVendor(req.params.id as string, req.body);
        res.status(200).json({ 
            status: "success",
            message: "Vendor updated successfully!", 
            vendor: vendor 
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

export const getAllVendors = async (req: Request, res: Response) => {
    try {
        const { q, page, limit } = req.query;

        // Call service with search query and pagination
        const result = await VendorService.getAllVendors(
            q ? String(q) : undefined,
            page ? Number(page) : undefined,
            limit ? Number(limit) : undefined
        );

        res.status(200).json({ 
            status: "success",
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
            vendors: result.vendors 
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

export const getVendorById = async (req: Request, res: Response) => {
    try {
        const vendor = await VendorService.getVendorById(req.params.id as string);
        res.status(200).json({ 
            status: "success",  
            vendor: vendor 
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

export const deleteVendor = async (req: Request, res: Response) => {
    try {
        const vendor = await VendorService.deleteVendor(req.params.id as string);
        res.status(200).json({
            status: "success", 
            message: "Vendor deleted successfully!", 
            vendor
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
export const addPhoneToVendor = async (req: Request, res: Response) => {
    try {
        const { vendorId } = req.params;
        const { label, phoneNo } = req.body;

        if (!label || !phoneNo) {
            return res.status(400).json({
                status: "error",
                message: "Label and phone number are required"
            });
        }

        const vendor = await VendorService.addPhoneToVendor(vendorId as string, { label, phoneNo });
        res.status(200).json({
            status: "success",
            message: "Phone number added successfully",
            vendor
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

export const removePhoneFromVendor = async (req: Request, res: Response) => {
    try {
        const { vendorId, phoneIndex } = req.params;

        const vendor = await VendorService.removePhoneFromVendor(vendorId as string, parseInt(phoneIndex as string));
        res.status(200).json({
            status: "success",
            message: "Phone number removed successfully",
            vendor
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
export const addEmailToVendor = async (req: Request, res: Response) => {
    try {
        const { vendorId } = req.params;
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: "error",
                message: "Email is required"
            });
        }

        const vendor = await VendorService.addEmailToVendor(vendorId as string, email);
        res.status(200).json({
            status: "success",
            message: "Email added successfully",
            vendor
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

export const removeEmailFromVendor = async (req: Request, res: Response) => {
    try {
        const { vendorId, emailIndex } = req.params;

        const vendor = await VendorService.removeEmailFromVendor(vendorId as string, parseInt(emailIndex as string));
        res.status(200).json({
            status: "success",
            message: "Email removed successfully",
            vendor
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