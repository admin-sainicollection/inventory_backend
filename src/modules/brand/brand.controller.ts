import { Request, Response } from "express";
import * as BrandService from "./brand.service";
import { uploadBuffer } from "../../config/cloudinary/cloudinary";
import { saveImageLocally } from "../../utils/fileUploadHelper";
import { deleteLocalImage } from "../../utils/fileDeleteHelper";

export const addBrand = async (req: Request, res: Response) => {
    try {
        const { name, parentCompany, description, manufactureType } = req.body;

        // Validate required fields
        if (!name) {
            return res.status(400).json({
                status: "error",
                message: "Brand name is required"
            });
        }

        // ✅ FIX: Handle manufactureType properly for form data arrays
        let processedManufactureType: string[] = [];

        if (manufactureType) {
            if (Array.isArray(manufactureType)) {
                processedManufactureType = manufactureType;
            } else if (typeof manufactureType === 'string') {
                processedManufactureType = [manufactureType];
            }
        }

        // ✅ FIX: Better validation message
        if (processedManufactureType.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "At least one manufacture type is required"
            });
        }

        // If multer memoryStorage used, req.file.buffer will be available
        let brandLogoUrl: string | undefined;
        if (req.file && (req.file as any).buffer) {
            // brandLogoUrl = await uploadBuffer((req.file as any).buffer, "inventory/brands");
            brandLogoUrl = await saveImageLocally(
                req.file.buffer,
                "brands",
                req.file.originalname
            );

        } 
        // else {
        //     return res.status(400).json({
        //         status: "error",
        //         message: "Brand logo is required"
        //     });
        // }

        const brandPayload = {
            name,
            parentCompany: parentCompany || undefined,
            brandLogo: brandLogoUrl || '',
            description,
            manufactureType: processedManufactureType,
        };

        const brand = await BrandService.createBrand(brandPayload);

        return res.status(201).json({
            status: "success",
            message: "Brand Created Successfully",
            brand,
        });
    } catch (error: any) {
        console.error("addBrand error:", error);
        return res.status(500).json({ status: "error", message: error.message });
    }
};

/**
 * Update brand (optionally upload new logo to Cloudinary)
 */
export const updateBrand = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, parentCompany,description, manufactureType } = req.body;
        
        // Find existing brand first
        const existingBrand = await BrandService.getBrandById(id as string);
        if (!existingBrand) {
            return res.status(404).json({ status: "error", message: "Brand not found" });
        }
        
        const updateData: Record<string, any> = {};

        if (name) updateData.name = name;
        if (description) updateData.description = description;
        if (parentCompany !== undefined) updateData.parentCompany = parentCompany;

        if (manufactureType !== undefined) {
            let processedManufactureType: string[] = [];

            if (Array.isArray(manufactureType)) {
                processedManufactureType = manufactureType;
            } else if (typeof manufactureType === 'string') {
                processedManufactureType = [manufactureType];
            }

            if (processedManufactureType.length === 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Manufacture type must be a non-empty array"
                });
            }

            updateData.manufactureType = processedManufactureType;
        }

        // If a new logo file is uploaded, delete the old logo and save new one
        if (req.file && (req.file as any).buffer) {
            // Delete old logo if it exists
            if (existingBrand.brandLogo) {
                deleteLocalImage(existingBrand.brandLogo);
            }
            
            // Save new logo
            const brandLogoUrl = await saveImageLocally(
                req.file.buffer,
                "brands",
                req.file.originalname
            );
            updateData.brandLogo = brandLogoUrl;
        }

        const brand = await BrandService.updateBrand(id as string, updateData);

        if (!brand) {
            return res.status(404).json({ status: "error", message: "Brand not found" });
        }

        return res.status(200).json({
            status: "success",
            message: "Brand updated successfully",
            brand,
        });
    } catch (error: any) {
        console.error("updateBrand error:", error);
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

export const deleteBrand = async (req: Request, res: Response) => {
    try {
        const brand = await BrandService.deleteBrand(req.params.id as string);

        res.status(200).json({
            status: "success",
            message: "Brand deleted successfully",
            brand
        });
    } catch (error: any) {
        // Handle specific error for brand being used in car models
        if (error.message.includes("associated with one or more car models")) {
            return res.status(400).json({
                status: "error",
                message: error.message
            });
        }

        // Handle other errors
        if (error.message.includes("not found")) {
            return res.status(404).json({
                status: "error",
                message: error.message
            });
        }

        res.status(400).json({ status: "error", message: error.message });
    }
};

export const getAllBrands = async (req: Request, res: Response) => {
    try {
        const { q, limit, page, manufactureType } = req.query;

        // Call service with all parameters including manufactureType
        const result = await BrandService.getAllBrands(
            q ? String(q) : null,
            limit ? Number(limit) : undefined,
            page ? Number(page) : undefined,
            manufactureType ? String(manufactureType) : undefined
        );

        res.status(200).json({
            status: "success",
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
            brands: result.brands,
        });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const getBrandById = async (req: Request, res: Response) => {
    try {
        const brand = await BrandService.getBrandById(req.params.id as string);

        if (!brand) {
            return res.status(404).json({
                status: "error",
                message: "Brand not found"
            });
        }

        res.status(200).json({
            status: "success",
            brand
        });
    } catch (error: any) {
        res.status(404).json({ status: "error", message: error.message });
    }
};

export const getBrandsByManufactureType = async (req: Request, res: Response) => {
    try {
        const { manufactureType } = req.params;
        const { limit, page } = req.query;

        const result = await BrandService.getBrandsByManufactureType(
            manufactureType as string,
            limit ? Number(limit) : undefined,
            page ? Number(page) : undefined
        );

        res.status(200).json({
            status: "success",
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
            brands: result.brands,
        });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// Missing controllers that need to be implemented:

export const getBrandsByMultipleManufactureTypes = async (req: Request, res: Response) => {
    try {
        const { manufactureTypes } = req.body; // Expecting array in request body
        const { limit, page } = req.query;

        if (!manufactureTypes || !Array.isArray(manufactureTypes)) {
            return res.status(400).json({
                status: "error",
                message: "manufactureTypes must be provided as an array"
            });
        }

        const result = await BrandService.getBrandsByMultipleManufactureTypes(
            manufactureTypes,
            limit ? Number(limit) : undefined,
            page ? Number(page) : undefined
        );

        res.status(200).json({
            status: "success",
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
            brands: result.brands,
        });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const checkBrandExists = async (req: Request, res: Response) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({
                status: "error",
                message: "Brand name is required"
            });
        }

        const exists = await BrandService.checkBrandExists(String(name));

        res.status(200).json({
            status: "success",
            exists,
            message: exists ? "Brand exists" : "Brand does not exist"
        });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const getBrandStats = async (req: Request, res: Response) => {
    try {
        const stats = await BrandService.getBrandStats();

        res.status(200).json({
            status: "success",
            data: stats
        });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

// export const searchBrands = async (req: Request, res: Response) => {
//     try {
//         const { search, manufactureTypes, page, limit } = req.body;

//         const result = await BrandService.searchBrands({
//             search,
//             manufactureTypes,
//             page: page ? Number(page) : undefined,
//             limit: limit ? Number(limit) : undefined
//         });

//         res.status(200).json({
//             status: "success",
//             total: result.total,
//             page: result.page,
//             limit: result.limit,
//             totalPages: result.totalPages,
//             brands: result.brands,
//         });
//     } catch (error: any) {
//         res.status(500).json({ status: "error", message: error.message });
//     }
// };