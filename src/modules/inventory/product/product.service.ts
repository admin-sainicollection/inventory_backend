import Category from "../category/category.model";
import Product, { IProduct } from "./product.model";

export const ProductService = {
    async create(data: Partial<IProduct>): Promise<IProduct> {
        const category = await Category.findOne({ name: data.category });
        if (!category) {
            throw new Error("Category not found");
        }

        const validAttributes: Record<string, any> = {};
        if (category.attributesTemplate) {
            category.attributesTemplate.forEach((field) => {
                if (data.attributes && data.attributes[field.key] !== undefined) {
                    validAttributes[field.key] = data.attributes[field.key];
                }
            })
        }
        const product = await Product.create({
            ...data,
            attributes: validAttributes
        });
        return product;
    },

    async update(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
        const updatedProduct = await Product.findById(id);
        if (!updatedProduct) throw new Error("Product not found");

        const category = await Category.findOne({ name: updatedProduct.category });
        const validAttributes: Record<string, any> = {};
        if (category?.attributesTemplate && data.attributes) {
            category.attributesTemplate.forEach((field) => {
                if (data.attributes && data.attributes[field.key] !== undefined) {
                    validAttributes[field.key] = data.attributes[field.key];
                }
            });
        }

        Object.assign(updatedProduct, data, {attributes: validAttributes});
        await updatedProduct.save();
        return updatedProduct;
    },

    async delete(id: string): Promise<void> {
        const deleted = await Product.findByIdAndDelete(id);
        if (!deleted) throw new Error("Product not found");
    },

    async getAll(): Promise<IProduct[]> {
        return Product.find();
    },

    async getById(id: string): Promise<IProduct | null> {
        const product = await Product.findById(id);
        if (!product) throw new Error("Product not found");
        return product;
    }
};
