import { Request, Response } from "express";
import { ProductService } from "./product.service";

export const createProduct = async (req: Request, res: Response) => {
    try {
        const product = await ProductService.create(req.body);
        return res.status(201).json({
            status:"success",
            message: "Product created successfully",
            product,
        });
    } catch (err: any) {
        console.error("Create Product Error:", err);
        return res.status(400).json({
            message: err.message || "Failed to create product",
        });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await ProductService.update(id as string, req.body);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json({
            status:"success",
            message: "Product updated successfully",
            product,
        });
    } catch (err: any) {
        console.error("Update Product Error:", err);
        return res.status(400).json({
            message: err.message || "Failed to update product",
        });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await ProductService.delete(id as string);
        return res.status(200).json({
            message: "Product deleted successfully",
        });
    } catch (err: any) {
        console.error("Delete Product Error:", err);
        return res.status(400).json({
            message: err.message || "Failed to delete product",
        });
    }
};

export const getAllProducts = async (_req: Request, res: Response) => {
    try {
        const products = await ProductService.getAll();
        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No products found" });
        }
        return res.status(200).json({ products });
    } catch (err: any) {
        console.error("Get All Products Error:", err);
        return res.status(500).json({
            message: err.message || "Failed to fetch products",
        });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await ProductService.getById(id as string  );
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json(product);
    } catch (err: any) {
        console.error("Get Product By ID Error:", err);
        return res.status(404).json({
            message: err.message || "Failed to fetch product",
        });
    }
};
