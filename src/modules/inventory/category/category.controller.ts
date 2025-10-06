import { Request, Response } from "express";
import Category from "./category.model";

export const addCategory = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        const existing = await Category.findOne({ name });
        if (existing) {
            return res.status(400).json({ message: "Category with this name already exists" });
        }

        const category = await Category.create({ name, description });
        res.status(201).json({ message: "Category created successfully", category });
    } catch (error: any) {
        res.status(500).json({ message: error.message })
    }
}