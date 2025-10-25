import CarModel from "./compatibility.model";
import { Request, Response } from "express";
import Product from "../product/product.model";

export const addCarModel = async (req: Request, res: Response) => {
    try {
        const { name, brand, variants, fuelType, year, transmission } = req.body;

        const existing = await CarModel.findOne({ name });
        if (existing) {
            return res.status(400).json({ message: "Car model already exists" });
        }

        const carModel = await CarModel.create({
            name,
            brand,
            variants: variants || [],
            fuelType: fuelType || [],
            year: year || [],
            transmission: transmission || []
        });

        return res.status(201).json({status:"success", message: "Car model added", model: carModel });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const updateCarModel = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, brand, variants, fuelType, year, transmission } = req.body;

        const updated = await CarModel.findByIdAndUpdate(
            id,
            { name, brand, variants, fuelType, year, transmission },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Car model not found" });
        }

        return res.status(200).json({status:"success", message: "Car model updated", model: updated });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteCarModel = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    // ✅ Check if CarModel exists
    const carModel = await CarModel.findById(id);
    if (!carModel) {
      return res.status(404).json({ message: "Car model not found" });
    }

    // ✅ Check if this CarModel is used in any product's compatibility
    const usedInProduct = await Product.findOne({
      "compatibility.name": carModel.name,
      "compatibility.brand": carModel.brand,
    });

    if (usedInProduct) {
      return res.status(400).json({
        message: `This car model is used in product "${usedInProduct.name}". Please remove it from product compatibility before deleting.`,
      });
    }

    // ✅ Safe to delete
    await CarModel.findByIdAndDelete(id);
    res.json({ message: "Car model deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};


export const getAllCarModels = async (req: Request, res: Response) => {
    try {
        const models = await CarModel.find().sort({ name: 1 });
        res.status(200).json({ models });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};


export const getCarModelById = async (req:Request, res: Response)=>{
     try {
            const { id } = req.params;
            const carModel = await CarModel.findById(id);
            if (!carModel) {
                return res.status(404).json({ message: "carModel not found" });
            }
            return res.status(200).json(carModel);
        } catch (err: any) {
            console.error("Get carModel By ID Error:", err);
            return res.status(404).json({
                message: err.message || "Failed to fetch carModel",
            });
        }
}