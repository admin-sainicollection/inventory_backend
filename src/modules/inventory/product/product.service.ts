import Category from "../category/category.model";
import Product, { IProduct } from "./product.model";

export const ProductService = {
    // ✅ CREATE PRODUCT
    async create(data: Partial<IProduct>): Promise<IProduct> {
        // ✅ Check for duplicate SKU or Name
        const existingProduct = await Product.findOne({
            $or: [{ sku: data.sku }, { name: data.name }]
        });

        if (existingProduct) {
            throw new Error("Product with the same name or SKU already exists");
        }
        // Ensure category exists
        const category = await Category.findOne({ name: data.category });
        if (!category) {
            throw new Error("Category not found");
        }

        // Validate attributes against category template
        const validAttributes: Record<string, any> = {};
        if (category.attributesTemplate && data.attributes) {
            category.attributesTemplate.forEach((field) => {
                if (data.attributes && data.attributes[field.key] !== undefined) {
                    validAttributes[field.key] = data.attributes[field.key];
                }
            });
        }

        // Create product
        const product = await Product.create({
            ...data,
            attributes: validAttributes,
        });

        return product;
    },

    // ✅ UPDATE PRODUCT
    async update(id: string, data: Partial<IProduct>): Promise<IProduct> {
        const product = await Product.findById(id);
        if (!product) {
            throw new Error("Product not found");
        }

        // If category is being changed, validate new category
        const categoryName = data.category || product.category;
        const category = await Category.findOne({ name: categoryName });
        if (!category) {
            throw new Error("Category not found");
        }

        // Re-validate attributes if provided
        const validAttributes: Record<string, any> = {};
        if (category.attributesTemplate && data.attributes) {
            category.attributesTemplate.forEach((field) => {
                if (data.attributes && data.attributes[field.key] !== undefined) {
                    validAttributes[field.key] = data.attributes[field.key];
                }
            });
        }

        // Update fields
        Object.assign(product, data);
        if (data.attributes) {
            product.attributes = validAttributes;
        }

        await product.save();
        return product;
    },

    // ✅ DELETE PRODUCT
    async delete(id: string): Promise<void> {
        const deleted = await Product.findByIdAndDelete(id);
        if (!deleted) {
            throw new Error("Product not found");
        }
    },

    // ✅ GET ALL PRODUCTS
    async getAll(): Promise<IProduct[]> {
        return Product.find().populate("compatibility"); // optional populate if ref exists
    },

    // ✅ GET PRODUCT BY ID
    async getById(id: string): Promise<IProduct> {
        const product = await Product.findById(id).populate("compatibility");
        if (!product) {
            throw new Error("Product not found");
        }
        return product;
    }
};
