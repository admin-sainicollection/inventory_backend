import { Request, Response } from "express";
import Category from "./category.model";
import Product from "../product/product.model";

export const addCategory = async (req: Request, res: Response) => {
    try {
        const { name, description, attributesTemplate } = req.body;

        const existing = await Category.findOne({ name });
        if (existing) {
            return res.status(400).json({ message: "Category with this name already exists" });
        }

        const category = await Category.create({
            name,
            description,
            attributesTemplate: attributesTemplate || [],
        });

        res.status(201).json({
            status:"success",
            message: "Category created successfully",
            category,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, attributesTemplate } = req.body;

        const category = await Category.findByIdAndUpdate(
            id,
            {
                ...(name && { name }),
                ...(description && { description }),
                ...(attributesTemplate && { attributesTemplate }),
            },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({
            status:"success",
            message: "Category updated successfully",
            category,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;

        // Find the category
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Check if any product is using this category
        const usedInProducts = await Product.findOne({ category: category.name });
        if (usedInProducts) {
            return res.status(400).json({
                message: `Cannot delete category "${category.name}". Remove or reassign products using this category first.`
            });
        }

        // Delete category
        await Category.findByIdAndDelete(id);
        return res.status(200).json({ message: "Category deleted successfully" });

    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};


export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json({ categories });
    } catch (error: any) {
        res.status(500).json({ message: (error).message })
    }
}