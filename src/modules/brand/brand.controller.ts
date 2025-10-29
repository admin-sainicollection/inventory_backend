import { Request, Response } from "express";
import * as BrandService from "./brand.service";
import { uploadBuffer } from "../../config/cloudinary/cloudinary";

export const addBrand = async (req: Request, res: Response) => {
  try {
    const { name, parentCompany } = req.body;

    // If multer memoryStorage used, req.file.buffer will be available
    let brandLogoUrl: string | undefined;
    if (req.file && (req.file as any).buffer) {
      // uploadBuffer returns the secure url string
      brandLogoUrl = await uploadBuffer((req.file as any).buffer, "inventory/brands");
    }

    const brandPayload: {
      name: string;
      parentCompany?: string;
      brandLogo?: string;
    } = {
      name,
      parentCompany,
    };

    if (brandLogoUrl) {
      brandPayload.brandLogo = brandLogoUrl;
    }

    const brand = await BrandService.createBrand(brandPayload);

    return res.status(200).json({
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
    const { name, parentCompany } = req.body;
    const updateData: Record<string, any> = {};

    if (name) updateData.name = name;
    if (parentCompany) updateData.parentCompany = parentCompany;

    // If a new logo file is uploaded, upload to Cloudinary and add url to updateData
    if (req.file && (req.file as any).buffer) {
      const brandLogoUrl = await uploadBuffer((req.file as any).buffer, "inventory/brands");
      updateData.brandLogo = brandLogoUrl;

      // TODO (optional): If you track Cloudinary public_id in DB, delete previous image here
      // so you don't accumulate unused images. You would need the public_id stored earlier.
    }

    const brand = await BrandService.updateBrand(req.params.id as string, updateData);

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
        const brand = await BrandService.deleteBrand(req.body.id);
        res.status(200).json({ status: "success", message: "Brand deleted successfully", brand });
    } catch (error: any) {
        res.status(400).json({ status: "error", message: error.message });
    }
};

export const getAllBrands = async (req: Request, res: Response) => {
    try {
        const brands = await BrandService.getAllBrands();
        res.status(200).json({ status: "success", brands });
    } catch (error: any) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

export const getBrandById = async (req: Request, res: Response) => {
    try {
        const brand = await BrandService.getBrandById(req.params.id as string);
        res.status(200).json({ status: "success", brand });
    } catch (error: any) {
        res.status(404).json({ status: "error", message: error.message });
    }
};
