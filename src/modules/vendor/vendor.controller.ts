import { Request, Response } from 'express';
import * as VendorService from './vendor.service';

export const addVendor = async (req: Request, res: Response) => {
    try {
        const vendor = await VendorService.createVendor(req.body);
        res.status(200).json({ status: "success", message: "Vendor Created Suffessfully", vendor });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: error.message });
    }
}

export const getAllVendors = async (req: Request, res: Response) => {
    try {
        const vendors = await VendorService.getAllVendors();
        res.status(200).json({ status: "success", vendors: vendors })
    } catch (error:any) {
        res.status(500).json({status:"error", message: error.message})
    }
}

export const getVendorById = async (req: Request, res: Response) => {
    try {
        const vendor = await VendorService.getVendorById(req.params.id as string);
        res.status(200).json({ status: "success",  vendor: vendor });
    } catch (error:any) {
        res.status(500).json({status:"error", message: error.message})
    }
}

export const updateVendor = async (req: Request, res: Response) => {
    try {
        const vendor = await VendorService.updateVendor(req.params.id as string, req.body);
        res.status(200).json({ status: "success",message:"Vender updated successfuly!", vendor : vendor });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: error.message });
    }
}

export const deleteVendor = async (req:Request, res:Response)=>{
    try {
        const vendor = await VendorService.deleteVendor(req.body.id);
        res.json({status:"success", message:"Vender deleted successfully!", vendor})
    } catch (error:any) {
        res.status(500).json({status:"error", message: error.message})
    }
}