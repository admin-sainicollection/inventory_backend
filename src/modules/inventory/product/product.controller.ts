import { Request, Response } from "express";
import { ProductService } from "./product.service";
import { uploadBuffer } from "../../../config/cloudinary/cloudinary";

// ✅ CREATE PRODUCT
export const createProduct = async (req: Request, res: Response) => {
    try {
        let uploadedImages: string[] = [];

        // Handle multiple image uploads
        if (req.files && Array.isArray(req.files)) {
            uploadedImages = await Promise.all(
                req.files.map(async (file: Express.Multer.File) =>
                    await uploadBuffer(file.buffer, "inventory/products")
                )
            );
        }

        const productDataBody = req.body;

        let description = {
            text: '',
            jsonFields: {}
        };
        
        if (productDataBody.description) {
            if (typeof productDataBody.description === 'string') {
                try {
                    description = JSON.parse(productDataBody.description);
                } catch (error) {
                    console.error('Failed to parse description:', error);
                }
            } else {
                description = productDataBody.description;
            }
        }

        // Parse source if it's a string
        let source = {
            type: 'manual' as 'manual' | 'price-list' | 'import' | 'api',
            id:"",
            date: new Date(),
            metadata: {}
        };
        
        if (productDataBody.source) {
            if (typeof productDataBody.source === 'string') {
                try {
                    source = JSON.parse(productDataBody.source);
                } catch (error) {
                    console.error('Failed to parse source:', error);
                }
            } else {
                source = {
                    type: productDataBody.source.type || 'manual',
                    id: productDataBody.source.id,
                    date: productDataBody.source.date ? new Date(productDataBody.source.date) : new Date(),
                    metadata: productDataBody.source.metadata || {}
                };
            }
        }

        const productData = {
            ...productDataBody,
            productImages: uploadedImages,
            description: {
                text: description.text || '',
                jsonFields: description.jsonFields || {}
            },
            // Add source data
            source: {
                type: source.type,
                id: source.id,
                date: source.date,
                metadata: source.metadata
            }
        };

        const product = await ProductService.create(productData, req.files as Express.Multer.File[]);
        return res.status(201).json({
            status: "success",
            message: "Product created successfully",
            product,
        });
    } catch (err: any) {
        console.error("Create Product Error:", err);
        return res.status(400).json({
            status: "error",
            message: err.message || "Failed to create product",
        });
    }
};

// ✅ UPDATE PRODUCT
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        let description = {
            text: '',
            jsonFields: {}
        };

        if (updatedData.description) {
            if (typeof updatedData.description === 'string') {
                try {
                    description = JSON.parse(updatedData.description);
                } catch (error) {
                    console.error('Failed to parse description:', error);
                }
            } else {
                description = updatedData.description;
            }
        }

        // Parse source if it exists in update (usually source shouldn't be updated, but handle it)
        let sourceUpdate = undefined;
        if (updatedData.source) {
            if (typeof updatedData.source === 'string') {
                try {
                    sourceUpdate = JSON.parse(updatedData.source);
                } catch (error) {
                    console.error('Failed to parse source:', error);
                }
            } else {
                sourceUpdate = {
                    type: updatedData.source.type,
                    id: updatedData.source.id,
                    date: updatedData.source.date ? new Date(updatedData.source.date) : new Date(),
                    metadata: updatedData.source.metadata
                };
            }
        }

        const processedData = {
            ...updatedData,
            description: {
                text: description.text || '',
                jsonFields: description.jsonFields || {}
            },
            // Only include source if provided (usually source shouldn't be changed after creation)
            ...(sourceUpdate && { source: sourceUpdate })
        };

        const product = await ProductService.update(
            id as string,
            processedData,
            req.files as Express.Multer.File[]
        );

        return res.status(200).json({
            status: "success",
            message: "Product updated successfully",
            product,
        });
    } catch (err: any) {
        console.error("Update Product Error:", err);
        return res.status(400).json({
            status: "error",
            message: err.message || "Failed to update product",
        });
    }
};

// ✅ DELETE PRODUCT
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await ProductService.delete(id as string);
        return res.status(200).json({
            status: "success",
            message: "Product deleted successfully",
        });
    } catch (err: any) {
        console.error("Delete Product Error:", err);
        return res.status(400).json({
            status: "error",
            message: err.message || "Failed to delete product",
        });
    }
};

// ✅ GET ALL PRODUCTS (with search)
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const { search } = req.query as { search?: string };
        const productsResult = await ProductService.getAll({ q: search });

        // ✅ FIX: Return empty array instead of 404 when no products found
        return res.status(200).json({
            status: "success",
            products: productsResult.products || [],
            total: productsResult.total || 0
        });

    } catch (err: any) {
        console.error("Get All Products Error:", err);
        return res.status(500).json({
            status: "error",
            message: err.message || "Failed to fetch products",
        });
    }
};

// ✅ GET PRODUCT BY ID
export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await ProductService.getById(id as string);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json({ status: "success", product });
    } catch (err: any) {
        console.error("Get Product By ID Error:", err);
        return res.status(404).json({
            status: "error",
            message: err.message || "Failed to fetch product",
        });
    }
};