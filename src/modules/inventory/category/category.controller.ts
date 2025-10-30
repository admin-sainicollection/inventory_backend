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
    const { q, limit, page } = req.query;

    // Convert pagination params to numbers with defaults
    const limitNum = Number(limit) > 0 ? Number(limit) : 0; // 0 = no limit
    const pageNum = Number(page) > 0 ? Number(page) : 1;
    const skip = limitNum ? (pageNum - 1) * limitNum : 0;

    let query: any = {};

    // 🔍 If search keyword (q) is provided
    if (q && typeof q === "string" && q.trim() !== "") {
      const regex = new RegExp(q, "i"); // case-insensitive search
      query = {
        $or: [
          { name: regex },
          { description: regex },
          { "attributes.name": regex },
          { "attributes.value": regex },
        ],
      };
    }

    // 🧾 Fetch categories based on query + pagination
    const categoriesQuery = Category.find(query)
      .sort({ createdAt: -1 })
      .skip(skip);

    if (limitNum > 0) categoriesQuery.limit(limitNum);

    const categories = await categoriesQuery.exec();
    const total = await Category.countDocuments(query);

    res.status(200).json({
      status: "success",
      message: q
        ? `Showing results for "${q}"`
        : "All categories fetched successfully",
      total,
      page: pageNum,
      limit: limitNum || "no limit",
      categories,
    });
  } catch (error: any) {
    console.error("getAllCategories error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};


export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID format (helps avoid invalid MongoDB ObjectId errors)
    if (!id || id.length !== 24) {
      return res.status(400).json({
        status: "error",
        message: "Invalid category ID format",
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        status: "error",
        message: "Category not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Category fetched successfully",
      category,
    });
  } catch (error: any) {
    console.error("getCategoryById error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
