import { Request, Response } from "express";
import CarModel from "./compatibility.model";
import Product from "../product/product.model";
import { addCarModelSchema, updateCarModelSchema } from "./compatibility.validation";

/**
 * Add a new car model
 */
const REL_UPLOAD_BASE = "/uploads/carModels"; // used in URLs returned to client

export const addCarModel = async (req: Request, res: Response) => {
  try {
    // multer will populate req.files for fields
    // req.body.generations expected to be a JSON string or array with imagesCount per generation
    const {
      name,
      brand,            // brand expected as JSON string or object
      variants,
      fuelTypes,
      transmissions,
      generations,
      brandName,
      brandLogo,
      parentCompany,
    } = req.body;

    // parse brand if sent as brandName / brandLogo pattern (we support both)
    let brandObj: any = null;
    if (brand) {
      brandObj = typeof brand === "string" ? JSON.parse(brand) : brand;
    } else if (brandName || brandLogo || parentCompany) {
      brandObj = { name: brandName || "", logo: brandLogo || "", parentCompany: parentCompany || "" };
    }

    // parsed arrays (they might be strings when sent in form-data)
    const parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants || [];
    const parsedFuelTypes = typeof fuelTypes === "string" ? JSON.parse(fuelTypes) : fuelTypes || [];
    const parsedTransmissions = typeof transmissions === "string" ? JSON.parse(transmissions) : transmissions || [];

    // parse generations array (should include imagesCount property per generation)
    const parsedGenerations = typeof generations === "string" ? JSON.parse(generations) : (generations || []);

    // baseImage file -> store relative url
    const files = req.files as any; // multer typings
    let baseImageUrl: string | undefined;
    if (files && files.baseImage && files.baseImage.length > 0) {
      const f = files.baseImage[0];
      // f.filename exists when using diskStorage
      baseImageUrl = `${process.env.BASE_URL_SERVER}${REL_UPLOAD_BASE}/${f.filename}`;
    }

    // generation images: multer field name is 'generationImages' (multiple files appended in order)
    const genFiles = files && files.generationImages ? files.generationImages : [];
    // Map files sequentially using imagesCount present in parsedGenerations
    let pointer = 0;
    parsedGenerations.forEach((gen: any) => {
      const count = Number(gen.imagesCount || 0);
      const assigned = genFiles.slice(pointer, pointer + count).map((f: any) => `${process.env.BASE_URL_SERVER}${REL_UPLOAD_BASE}/${f.filename}`);
      gen.images = assigned;
      pointer += count;
    });

    // check duplicates: same name + brand.name
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

    return res.status(201).json({
      status: "success",
      message: "Car model added successfully",
      model: carModel,
    });
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
      brand,
      variants,
      fuelTypes,
      transmissions,
      generations,
      brandName,
      brandLogo,
      parentCompany,
    } = req.body;

    let brandObj: any = null;
    if (brand) brandObj = typeof brand === "string" ? JSON.parse(brand) : brand;
    else if (brandName || brandLogo || parentCompany) brandObj = { name: brandName || "", logo: brandLogo || "", parentCompany: parentCompany || "" };

    const parsedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
    const parsedFuelTypes = typeof fuelTypes === "string" ? JSON.parse(fuelTypes) : fuelTypes;
    const parsedTransmissions = typeof transmissions === "string" ? JSON.parse(transmissions) : transmissions;

    const parsedGenerations = typeof generations === "string" ? JSON.parse(generations) : (generations || []);

    const files = req.files as any;
    let baseImageUrl: string | undefined;
    if (files && files.baseImage && files.baseImage.length > 0) {
      baseImageUrl = `${process.env.BASE_URL_SERVER}${REL_UPLOAD_BASE}/${files.baseImage[0].filename}`;
    }

    const genFiles = files && files.generationImages ? files.generationImages : [];
    let pointer = 0;
    parsedGenerations.forEach((gen: any) => {
      const count = Number(gen.imagesCount || 0);
      const assigned = genFiles.slice(pointer, pointer + count).map((f: any) => `${process.env.BASE_URL_SERVER}${REL_UPLOAD_BASE}/${f.filename}`);
      gen.images = assigned;
      pointer += count;
    });

    const updateData: any = {};
    if (name) updateData.name = name;
    if (brandObj) updateData.brand = brandObj;
    if (parsedVariants) updateData.variants = parsedVariants;
    if (parsedFuelTypes) updateData.fuelTypes = parsedFuelTypes;
    if (parsedTransmissions) updateData.transmissions = parsedTransmissions;
    if (parsedGenerations) updateData.generations = parsedGenerations;
    if (baseImageUrl) updateData.baseImage = baseImageUrl;

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
        res.json({ status: "success", message: "Car model deleted successfully" });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Get all car models
 */
export const getAllCarModels = async (req: Request, res: Response) => {
    try {
        const models = await CarModel.find().sort({ name: 1 });
        res.status(200).json({ status: "success", models });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
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
