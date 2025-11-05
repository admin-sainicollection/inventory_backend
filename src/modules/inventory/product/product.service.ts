import { uploadBuffer } from "../../../config/cloudinary/cloudinary";
import Category from "../category/category.model";
import Product, { IProduct } from "./product.model";

export const ProductService = {
   async create(
    data: Partial<IProduct>,
    files?: Express.Multer.File[]
): Promise<IProduct> {
    // ✅ FIXED: Parse aliasNames if it's a string
    if (data.aliasNames && typeof data.aliasNames === 'string') {
        try {
            data.aliasNames = JSON.parse(data.aliasNames);
        } catch (error) {
            // If JSON parsing fails, set to empty array
            console.warn('Failed to parse aliasNames as JSON, setting to empty array');
            data.aliasNames = [];
        }
    }

    // Parse compatibility if it's a string
    if (typeof data.compatibility === 'string') {
        try {
            data.compatibility = JSON.parse(data.compatibility);
        } catch (error) {
            throw new Error("Invalid compatibility data format");
        }
    }

    // Parse attributes if it's a string
    if (typeof data.attributes === 'string') {
        try {
            data.attributes = JSON.parse(data.attributes);
        } catch (error) {
            throw new Error("Invalid attributes data format");
        }
    }

    // 🔍 Check for duplicate SKU or Name
    const existingProduct = await Product.findOne({
        $or: [{ sku: data.sku }, { name: data.name }],
    });
    if (existingProduct) {
        throw new Error("Product with the same name or SKU already exists");
    }

    // 🧩 Ensure category exists
    const category = await Category.findOne({ name: data.category });
    if (!category) {
        throw new Error("Category not found");
    }

    // 🧠 Validate attributes against category template
    const validAttributes: Record<string, any> = {};
    if (category.attributesTemplate && data.attributes) {
        category.attributesTemplate.forEach((field) => {
            if (data.attributes && data.attributes[field.key] !== undefined) {
                validAttributes[field.key] = data.attributes[field.key];
            }
        });
    }

    // 📸 Upload images to Cloudinary (if provided)
    let uploadedImages: string[] = [];
    if (files && files.length > 0) {
        uploadedImages = await Promise.all(
            files.map(async (file) => await uploadBuffer(file.buffer, "inventory/products"))
        );
    }

    // 🛠️ Create product
    const product = await Product.create({
        ...data,
        productImages: uploadedImages,
        attributes: validAttributes,
        // ✅ aliasNames will now be properly stored as array of strings
    });

    return product;
},

// ✅ UPDATE PRODUCT
async update(
    id: string,
    data: Partial<IProduct>,
    files?: Express.Multer.File[]
): Promise<IProduct> {
    const product = await Product.findById(id);
    if (!product) {
        throw new Error("Product not found");
    }

    // ✅ FIXED: Parse aliasNames if it's a string
    if (data.aliasNames && typeof data.aliasNames === 'string') {
        try {
            data.aliasNames = JSON.parse(data.aliasNames);
        } catch (error) {
            // If JSON parsing fails, don't modify existing aliasNames
            console.warn('Failed to parse aliasNames as JSON, keeping existing values');
            delete data.aliasNames; // Remove from update data
        }
    }

    // Parse compatibility if it's a string
    if (typeof data.compatibility === 'string') {
        try {
            data.compatibility = JSON.parse(data.compatibility);
        } catch (error) {
            throw new Error("Invalid compatibility data format");
        }
    }

    // Parse attributes if it's a string
    if (typeof data.attributes === 'string') {
        try {
            data.attributes = JSON.parse(data.attributes);
        } catch (error) {
            throw new Error("Invalid attributes data format");
        }
    }

    // 🧩 Validate or find category
    const categoryName = data.category || product.category;
    const category = await Category.findOne({ name: categoryName });
    if (!category) {
        throw new Error("Category not found");
    }

    // 🧠 Revalidate attributes if provided
    const validAttributes: Record<string, any> = {};
    if (category.attributesTemplate && data.attributes) {
        category.attributesTemplate.forEach((field) => {
            if (data.attributes && data.attributes[field.key] !== undefined) {
                validAttributes[field.key] = data.attributes[field.key];
            }
        });
    }

    // 📸 Handle image uploads (append to existing ones)
    let uploadedImages: string[] = product.productImages || [];
    if (files && files.length > 0) {
        const newImages = await Promise.all(
            files.map(async (file) => await uploadBuffer(file.buffer, "inventory/products"))
        );
        uploadedImages = [...uploadedImages, ...newImages];
    }

    // 🧾 Update product data
    Object.assign(product, {
        ...data,
        attributes: Object.keys(validAttributes).length
            ? validAttributes
            : product.attributes,
        productImages: uploadedImages,
    });

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

    // ✅ GET ALL PRODUCTS with Search + Pagination
    async getAll(query: {
        q?: string | undefined;
        limit?: number | undefined;
        page?: number | undefined;
    }): Promise<{ products: IProduct[]; total: number }> {
        const { q, limit = 10, page = 1 } = query;
        const skip = (page - 1) * limit;

        let searchQuery: any = {};

        // 🔍 Search across multiple fields
        if (q && q.trim() !== "") {
            const regex = new RegExp(q, "i");
            searchQuery = {
                $or: [
                    { name: regex },
                    { aliasNames: regex },
                    { sku: regex },
                    { barcode: regex },
                    { brand: regex },
                    { category: regex },
                    { vender: regex },
                    { description: regex },
                ],
            };
        }

        const [products, total] = await Promise.all([
            Product.find(searchQuery)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Product.countDocuments(searchQuery),
        ]);

        return { products, total };
    },

    // ✅ GET PRODUCT BY ID
    async getById(id: string): Promise<IProduct> {
        const product = await Product.findById(id);
        if (!product) {
            throw new Error("Product not found");
        }
        return product;
    },
};