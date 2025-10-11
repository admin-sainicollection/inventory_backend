import { Request, Response } from "express";
import { ProductService } from "./product.service";

export const createProduct = async (req: Request, res: Response) => {
    try {
        const product = await ProductService.create(req.body);
        res.status(201).json({ message: "Product created", product });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const product = await ProductService.update(req.params.id as string, req.body);
        res.json({ message: "Product updated", product });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const deletedProduct = await ProductService.delete(req.params.id as string);
        res.json({ message: "Product deleted", deletedProduct });
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

export const getAllProducts = async (_req: Request, res: Response) => {
    const products = await ProductService.getAll();
    if (!products || products.length === 0) {
        return res.status(404).json({ message: "No products found" });
    }
    res.json(products);
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const product = await ProductService.getById(req.params.id as string);
        if(!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (err: any) {
        res.status(404).json({ message: err.message });
    }
};
