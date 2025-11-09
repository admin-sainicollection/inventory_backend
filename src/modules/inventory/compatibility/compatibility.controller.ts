import { Request, Response } from "express";
import CarModel from "./compatibility.model";
import Product from "../product/product.model";
import { addCarModelSchema, updateCarModelSchema } from "./compatibility.validation";
import { uploadBuffer } from "../../../config/cloudinary/cloudinary";

/**
 * Add a new car model
 */
const REL_UPLOAD_BASE = "/uploads/carModels"; // used in URLs returned to client


export const addCarModel = async (req: Request, res: Response) => {
  try {
    const {
      name,
      variants,
      fuelTypes,
      transmissions,
      generations,
      brand,
      brandName,
      brandLogo,
      parentCompany,
    } = req.body;

    // Build brand object (support both patterns)
    let brandObj: any = null;
    if (brand) brandObj = typeof brand === "string" ? JSON.parse(brand) : brand;
    else if (brandName || brandLogo || parentCompany)
      brandObj = { name: brandName || "", logo: brandLogo || "", parentCompany: parentCompany || "" };

    // Parse arrays (frontend sends JSON strings for arrays)
    const parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants || [];
    const parsedFuelTypes = typeof fuelTypes === "string" ? JSON.parse(fuelTypes) : fuelTypes || [];
    const parsedTransmissions = typeof transmissions === "string" ? JSON.parse(transmissions) : transmissions || [];
    const parsedGenerations = typeof generations === "string" ? JSON.parse(generations) : (generations || []);

    // files from multer memoryStorage
    const files = req.files as any; // multer types
    // Base image upload
    let baseImageUrl: string | undefined;
    if (files?.baseImage?.[0]) {
      const f = files.baseImage[0];
      baseImageUrl = await uploadBuffer(f.buffer, "inventory/cars/baseImages");
    }

    // generationImages: they are sent as a flat list in the same order as generations
    const genFiles = files?.generationImages || [];
    let pointer = 0;
    for (const gen of parsedGenerations) {
      const count = Number(gen.imagesCount || 0);
      const slice = genFiles.slice(pointer, pointer + count);
      const uploaded = await Promise.all(slice.map((f: any) => uploadBuffer(f.buffer, "inventory/cars/generations")));
      gen.images = uploaded;
      pointer += count;
    }

    // Duplicate check (name + brand)
    const brandNameToCheck = brandObj?.name ?? "";
    const existing = await CarModel.findOne({ name, "brand.name": brandNameToCheck });
    if (existing) {
      return res.status(400).json({ message: "Car model already exists for this brand" });
    }

    const carModel = await CarModel.create({
      name,
      brand: brandObj,
      baseImage: baseImageUrl,
      variants: parsedVariants,
      fuelTypes: parsedFuelTypes,
      transmissions: parsedTransmissions,
      generations: parsedGenerations,
    });

    return res.status(201).json({ status: "success", message: "Car model added successfully", model: carModel });
  } catch (error: any) {
    console.error("addCarModel error:", error);
    return res.status(500).json({ message: error.message });
  }
};

export const updateCarModel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      variants,
      fuelTypes,
      transmissions,
      generations,
      brand,
      brandName,
      brandLogo,
      parentCompany,
      baseImageUrl, // Get baseImageUrl from body if provided
    } = req.body;

    let brandObj: any = null;
    if (brand) brandObj = typeof brand === "string" ? JSON.parse(brand) : brand;
    else if (brandName || brandLogo || parentCompany)
      brandObj = { name: brandName || "", logo: brandLogo || "", parentCompany: parentCompany || "" };

    const parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
    const parsedFuelTypes = typeof fuelTypes === "string" ? JSON.parse(fuelTypes) : fuelTypes;
    const parsedTransmissions = typeof transmissions === "string" ? JSON.parse(transmissions) : transmissions;
    const parsedGenerations = typeof generations === "string" ? JSON.parse(generations) : (generations || []);

    const files = req.files as any;
    
    // Handle base image
    let finalBaseImageUrl = baseImageUrl; // Start with existing base image URL
    
    // If new base image is uploaded, use it
    if (files?.baseImage?.[0]) {
      finalBaseImageUrl = await uploadBuffer(files.baseImage[0].buffer, "inventory/cars/baseImages");
    }

    // Handle generation images - FIXED VERSION
    const genFiles = files?.generationImages || [];
    let pointer = 0;
    
    for (const gen of parsedGenerations) {
      const newImagesCount = Number(gen.imagesCount || 0);
      
      if (newImagesCount > 0) {
        const slice = genFiles.slice(pointer, pointer + newImagesCount);
        const uploadedUrls = await Promise.all(
          slice.map((f: any) => uploadBuffer(f.buffer, "inventory/cars/generations"))
        );
        
        // Merge existing images with new images instead of replacing
        const existingImages = Array.isArray(gen.images) ? gen.images : [];
        gen.images = [...existingImages, ...uploadedUrls];
        
        pointer += newImagesCount;
      }
      // If no new images, keep the existing images array as is
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (brandObj) updateData.brand = brandObj;
    if (parsedVariants) updateData.variants = parsedVariants;
    if (parsedFuelTypes) updateData.fuelTypes = parsedFuelTypes;
    if (parsedTransmissions) updateData.transmissions = parsedTransmissions;
    if (parsedGenerations) updateData.generations = parsedGenerations;
    if (finalBaseImageUrl) updateData.baseImage = finalBaseImageUrl;

    const updated = await CarModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: "Car model not found" });

    return res.status(200).json({ status: "success", message: "Car model updated successfully", model: updated });
  } catch (error: any) {
    console.error("updateCarModel error:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Delete car model
 */
export const deleteCarModel = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;

        const carModel = await CarModel.findById(id);
        if (!carModel) {
            return res.status(404).json({ message: "Car model not found" });
        }

        const usedInProduct = await Product.findOne({
            "compatibility.name": carModel.name,
            "compatibility.brand.name": carModel.brand.name,
        });

        if (usedInProduct) {
            return res.status(400).json({
                message: `This car model is used in product "${usedInProduct.name}". Please remove it before deleting.`,
            });
        }

        await CarModel.findByIdAndDelete(id);
        res.json({ status: "success", message: "Car model deleted successfully", carModel });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Get all car models
 */

export const getAllCarModels = async (req: Request, res: Response) => {
  try {
    const { q, limit, page } = req.query;

    // Convert pagination params to numbers with defaults
    const limitNum = Number(limit) > 0 ? Number(limit) : 0; // 0 = no limit
    const pageNum = Number(page) > 0 ? Number(page) : 1;
    const skip = limitNum ? (pageNum - 1) * limitNum : 0;

    let query: any = {};

    // If search query is provided, apply regex filters
    if (q && typeof q === "string" && q.trim() !== "") {
      const regex = new RegExp(q, "i"); // case-insensitive search
      query = {
        $or: [
          { "brand.name": regex },
          { name: regex },
          { transmissions: regex },
          { fuelTypes: regex },
          { variants: regex },
          { "generations.from": regex },
          { "generations.to": regex },
        ],
      };
    }

    // Fetch models based on query + pagination
    const modelsQuery = CarModel.find(query).sort({ name: 1 }).skip(skip);
    if (limitNum > 0) modelsQuery.limit(limitNum);

    const models = await modelsQuery.exec();
    const total = await CarModel.countDocuments(query);

    res.status(200).json({
      status: "success",
      message: q
        ? `Showing results for "${q}"`
        : "All car models fetched successfully",
      total,
      page: pageNum,
      limit: limitNum || "no limit",
      models,
    });
  } catch (error: any) {
    console.error("getAllCarModels error:", error);
    return res.status(500).json({ status: "error", message: error.message });
  }
};


/**
 * Get car model by ID
 */
export const getCarModelById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const carModel = await CarModel.findById(id);
        if (!carModel) {
            return res.status(404).json({ message: "Car model not found" });
        }
        return res.status(200).json({ status: "success", carModel });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

