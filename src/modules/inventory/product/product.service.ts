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

        const processedData = processDescriptionData(data);
        // 🛠️ Create product
        const product = await Product.create({
            ...processedData,
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

        const processedData = processDescriptionData(data);

        // 🧾 Update product data
        Object.assign(product, {
            ...processedData,
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

            const searchConditions: any[] = [];

            // TEXT FIELDS
            searchConditions.push(
                { name: regex },
                { aliasNames: regex },
                { partNo: regex },
                { barcode: regex },
                { brand: regex },
                { category: regex },
                { vender: regex },
                { "description.text": regex },
                { "compatibility.name": regex },
                { "compatibility.brand.name": regex },
                { "attributes.key": regex },
                { "attributes.value": regex }
            );

            // NUMERIC CHECK
            const numericValue = Number(searchTerm);
            const isNumeric = !isNaN(numericValue);

            if (isNumeric) {
                searchConditions.push(
                    { quantity: numericValue },
                    { mrp: numericValue },
                    { purchaseDiscount: numericValue },
                    { purchasePrice: numericValue },
                    { sellingPriceB2C: numericValue },
                    { sellingPriceB2B: numericValue }
                );
            }

            // ADVANCED OPERATORS
            if (searchTerm.startsWith(">")) {
                const num = Number(searchTerm.slice(1));
                if (!isNaN(num)) {
                    searchConditions.push({ mrp: { $gte: num } });
                    searchConditions.push({ sellingPriceB2C: { $gte: num } });
                }
            }

            if (searchTerm.startsWith("<")) {
                const num = Number(searchTerm.slice(1));
                if (!isNaN(num)) {
                    searchConditions.push({ mrp: { $lte: num } });
                    searchConditions.push({ sellingPriceB2C: { $lte: num } });
                }
            }

            searchQuery = { $or: searchConditions };
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


// Helper function to process description data and ensure proper structure
const processDescriptionData = (data: Partial<IProduct>): any => {
    const processedData = { ...data };

    // Handle description transformation
    if (processedData.description) {
        // If description is provided as a string (backward compatibility), convert to object
        if (typeof processedData.description === 'string') {
            processedData.description = {
                text: processedData.description,
                jsonFields: {}
            };
        }
        // Ensure description has both text and jsonFields
        else if (typeof processedData.description === 'object') {
            processedData.description = {
                text: processedData.description.text || '',
                jsonFields: processedData.description.jsonFields || {}
            };
        }
    } else {
        // Set default empty description object if not provided
        processedData.description = {
            text: '',
            jsonFields: {}
        };
    }

    return processedData;
}