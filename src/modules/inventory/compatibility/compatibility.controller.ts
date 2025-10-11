import CarModel from "./compatibility.model";
import { Request, Response } from "express";

export const addCarModel = async (req: Request, res: Response) => {
    try {
        const { name, brand } = req.body;
        const existing = await CarModel.findOne({ name });
        if (existing) {
            return res.status(400).json({ message: "Car model already exists" });
        }
        const carModel = await CarModel.create({ name, brand });
        return res.status(201).json({ message: "Car model added", model: carModel });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

export const updateCarModel = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, brand } = req.body;

        const updated = await CarModel.findByIdAndUpdate(id, { name, brand }, { new: true });
        if (!updated) {
            return res.status(404).json({ message: "Car model not found" });
        }
        return res.status(200).json({ message: "Car model updated", model: updated });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}


export const deleteCarModel = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        const deleted = await CarModel.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Car model not found" });
        }
        res.json({ message: "Deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: (error as Error).message });
    }
}

export const getAllCarModels = async (req: Request, res: Response) => {
    try {
        const models = await CarModel.find().sort({ name: 1 });
        res.status(200).json({ models });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}