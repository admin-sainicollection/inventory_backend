import { uploadBuffer } from "../../../config/cloudinary/cloudinary";
import Category from "../category/category.model";
import Product, { IProduct } from "./product.model";

export const ProductService = {
    async create(
        data: Partial<IProduct>,
        files?: Express.Multer.File[]
    ): Promise<IProduct> {
        // ✅ FIXED: Parse aliasNames if it's a string
        // if (data.aliasNames && typeof data.aliasNames === 'string') {
        //     try {
        //         data.aliasNames = JSON.parse(data.aliasNames);
        //     } catch (error) {
        //         // If JSON parsing fails, set to empty array
        //         console.warn('Failed to parse aliasNames as JSON, setting to empty array');
        //         data.aliasNames = [];
        //     }
        // }

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

        // 🔍 Check for duplicate partNo or Name
        const existingProduct = await Product.findOne({
            $or: [{ partNo: data.partNo }, { name: data.name }],
        });
        if (existingProduct) {
            throw new Error("Product with the same name or partNo already exists");
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

        // ✅ Parse aliasNames if it's a string
        // if (data.aliasNames && typeof data.aliasNames === 'string') {
        //     try {
        //         data.aliasNames = JSON.parse(data.aliasNames);
        //     } catch (error) {
        //         console.warn('Failed to parse aliasNames as JSON, keeping existing values');
        //         delete data.aliasNames;
        //     }
        // }

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

        // 🆕 CRITICAL FIX: Start with EMPTY array and only add what frontend sends
        let finalImages: string[] = [];

        // 📸 First, add NEW uploaded images
        if (files && files.length > 0) {
            const newImages = await Promise.all(
                files.map(async (file) => await uploadBuffer(file.buffer, "inventory/products"))
            );
            finalImages = [...finalImages, ...newImages];
        }

        // 🆕 Then, add REMAINING existing images sent from frontend
        if (data.productImages) {
            let remainingImages: string[] = [];

            if (Array.isArray(data.productImages)) {
                remainingImages = data.productImages;
            } else if (typeof data.productImages === 'string') {
                try {
                    remainingImages = JSON.parse(data.productImages);
                } catch (error) {
                    console.warn('Failed to parse productImages, using empty array');
                    remainingImages = [];
                }
            }

            finalImages = [...finalImages, ...remainingImages];
        }

        // 🧾 Update product data
        Object.assign(product, {
            ...data,
            attributes: Object.keys(validAttributes).length
                ? validAttributes
                : product.attributes,
            productImages: finalImages, // This now contains ONLY the images we want to keep
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

        if (q && q.trim() !== "") {
            const searchTerm = q.trim();
            const regex = new RegExp(searchTerm, "i");
            const numericValue = parseFloat(searchTerm);
            const isNumeric = !isNaN(numericValue);

            // Build search conditions array
            const searchConditions: any[] = [
                // Text fields
                { name: regex },
                { aliasNames: regex },
                { partNo: regex },
                { barcode: regex },
                { brand: regex },
                { category: regex },
                { vender: regex },
                { description: regex },

                // Compatibility fields
                { "compatibility.name": regex },
                { "compatibility.brand.name": regex },
                { "compatibility.variants": regex },
                { "compatibility.fuelTypes": regex },
                { "compatibility.transmissions": regex },
                { "compatibility.generations.from": regex },
                { "compatibility.generations.to": regex },
            ];

            // Add numeric searches if applicable
            if (isNumeric) {
                searchConditions.push(
                    { quantity: numericValue },
                    { mrp: numericValue },
                    { purchaseDiscount: numericValue },
                    { purchasePrice: numericValue },
                    { sellingPriceB2C: numericValue },
                    { sellingPriceB2B: numericValue },
                    // Range searches for "at least" functionality
                    { quantity: { $gte: numericValue } },
                    { mrp: { $gte: numericValue } },
                    { purchaseDiscount: { $gte: numericValue } },
                    { purchasePrice: { $gte: numericValue } },
                    { sellingPriceB2C: { $gte: numericValue } },
                    { sellingPriceB2B: { $gte: numericValue } }
                );
            }

            // Handle attribute search (if attributes are stored as key-value pairs)
            searchConditions.push({
                $or: [
                    { "attributes.key": regex },
                    { "attributes.value": regex }
                ]
            });

            searchQuery = { $or: searchConditions };

            // Special operators for advanced searching
            if (searchTerm.startsWith('>') && !isNaN(parseFloat(searchTerm.slice(1)))) {
                const value = parseFloat(searchTerm.slice(1));
                searchQuery = {
                    $or: [
                        { quantity: { $gt: value } },
                        { mrp: { $gt: value } },
                        { purchaseDiscount: { $gt: value } },
                        { purchasePrice: { $gt: value } },
                        { sellingPriceB2C: { $gt: value } },
                        { sellingPriceB2B: { $gt: value } }
                    ]
                };
            } else if (searchTerm.startsWith('<') && !isNaN(parseFloat(searchTerm.slice(1)))) {
                const value = parseFloat(searchTerm.slice(1));
                searchQuery = {
                    $or: [
                        { quantity: { $lt: value } },
                        { mrp: { $lt: value } },
                        { purchaseDiscount: { $lt: value } },
                        { purchasePrice: { $lt: value } },
                        { sellingPriceB2C: { $lt: value } },
                        { sellingPriceB2B: { $lt: value } }
                    ]
                };
            } else if (searchTerm.startsWith('=') && !isNaN(parseFloat(searchTerm.slice(1)))) {
                const value = parseFloat(searchTerm.slice(1));
                searchQuery = {
                    $or: [
                        { quantity: value },
                        { mrp: value },
                        { purchaseDiscount: value },
                        { purchasePrice: value },
                        { sellingPriceB2C: value },
                        { sellingPriceB2B: value }
                    ]
                };
            }
        }

        try {
            const [products, total] = await Promise.all([
                Product.find(searchQuery)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit),
                Product.countDocuments(searchQuery),
            ]);

            return { products, total };
        } catch (error) {
            console.error('Error searching products:', error);
            throw new Error('Failed to search products');
        }
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