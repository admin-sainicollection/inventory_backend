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

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const category = await Category.findByIdAndUpdate(id, { name, description }, { new: true, runValidators: true });

        if (!category) return res.status(404).json({ message: "Category not found" });
        res.status(200).json({ message: "Category updated successfully", category });
    } catch (error: any) {
        res.status(500).json({ message: error.message })
    }
}

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;

        const category = await Category.findByIdAndDelete(id);
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.status(200).json({ message: "Category deleted successfully" });

    } catch (error: any) {
        res.status(500).json({ message: (error).message })
    }
}

export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json({ categories });
    } catch (error: any) {
        res.status(500).json({ message: (error).message })
    }
}