import { Request, Response } from "express";
import * as BrandService from "./brand.service";

export const addBrand = async (req: Request, res: Response) => {
  try {
    const { name, parentCompany } = req.body;
    const brandLogo = req.file ? `/uploads/${req.file.filename}` : undefined;

    const brandPayload: {
      name: string;
      parentCompany?: string;
      brandLogo?: string;
    } = {
      name,
      parentCompany,
    };

    if (brandLogo) {
      brandPayload.brandLogo = brandLogo;
    }

    const brand = await BrandService.createBrand(brandPayload);

    res.status(200).json({
      status: "success",
      message: "Brand Created Successfully",
      brand,
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const updateBrand = async (req: Request, res: Response) => {
  try {
    const { name, parentCompany } = req.body;

    // Use same pattern as addBrand (consistent URL path)
    const brandLogo = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updateData: Record<string, any> = {};

    if (name) updateData.name = name;
    if (parentCompany) updateData.parentCompany = parentCompany;
    if (brandLogo) updateData.brandLogo = brandLogo;

    const brand = await BrandService.updateBrand(req.params.id as string, updateData);

    if (!brand) {
      return res.status(404).json({ status: "error", message: "Brand not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Brand updated successfully",
      brand,
    });
  } catch (error: any) {
    res.status(500).json({
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
