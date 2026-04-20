import { deleteLocalImage } from "../../utils/fileDeleteHelper";
import CarModel from "../inventory/compatibility/compatibility.model";
import Brand, { IBrand } from "./brand.model";

/**
 * Create a new brand
 */
export const createBrand = async (data: {
    name: string;
    parentCompany?: string;
    brandLogo?: string;
    description?:string;
    manufactureType: string[];
}) => {
    // Check if brand with same name already exists
    const existing = await Brand.findOne({ name: data.name });
    if (existing) {
        throw new Error("Brand with this name already exists");
    }

    // Validate required fields
    if (!data.name || !data.manufactureType  || data.manufactureType.length === 0) {
        throw new Error("Name and manufactureType are required fields");
    }

    return await Brand.create(data);
};

/**
 * Update a brand by ID
 */
export const updateBrand = async (id: string, data: Partial<IBrand>) => {
    // If name is being updated, check for duplicates
    if (data.name) {
        const existing = await Brand.findOne({
            name: data.name,
            _id: { $ne: id }
        });
        if (existing) {
            throw new Error("Brand with this name already exists");
        }
    }

    // Validate manufactureType if being updated
    if (data.manufactureType !== undefined) {
        if (!Array.isArray(data.manufactureType) || data.manufactureType.length === 0) {
            throw new Error("Manufacture type must be a non-empty array");
        }
    }

    const updated = await Brand.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
    );
    if (!updated) throw new Error("Brand not found");
    return updated;
};

/**
 * Delete a brand by ID
 */
export const deleteBrand = async (id: string) => {
    const brand = await Brand.findById(id);
    if (!brand) throw new Error("Brand not found");

    const usedInCar = await CarModel.findOne({
        $or: [
            { "brand._id": id },
            { "brand.name": brand.name }
        ]
    });

    if (usedInCar) {
        throw new Error("This brand is associated with one or more car models. Please remove those car models before deleting the brand.");
    }

    if (brand.brandLogo) {
        deleteLocalImage(brand.brandLogo);
    }

    await Brand.findByIdAndDelete(id);
    return brand;
};

/**
 * Get all brands with pagination, search, and manufacture type filtering
 */
export const getAllBrands = async (
    search?: string | null,
    limit?: number,
    page?: number,
    manufactureType?: string
) => {
    const query: any = {};

    if (search) {
        // Search by brand name or parent company (case-insensitive)
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { parentCompany: { $regex: search, $options: "i" } },
            { manufactureType: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
        ];
    }

    // ✅ FIX: Proper manufacture type filtering
    if (manufactureType && manufactureType !== 'all') {
        query.manufactureType = { $in: [manufactureType] };
    }

    // Pagination setup
    const currentPage = page || 1;
    const perPage = limit || 100000; // Increased default limit
    const skip = (currentPage - 1) * perPage;

    // Get total count for pagination
    const total = await Brand.countDocuments(query);

    // Execute query with pagination
    const brands = await Brand.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .exec();

    return {
        brands,
        total,
        page: currentPage,
        limit: perPage,
        totalPages: Math.ceil(total / perPage)
    };
};

/**
 * Get brand by ID
 */
export const getBrandById = async (id: string) => {
    const brand = await Brand.findById(id);
    if (!brand) throw new Error("Brand not found");
    return brand;
};

/**
 * Get brands by manufacture type with pagination
 */
export const getBrandsByManufactureType = async (
    manufactureType: string,
    limit?: number,
    page?: number
) => {
    const query = {
        manufactureType: { $in: [manufactureType] } // Exact match instead of regex
    };

    // Pagination setup
    const currentPage = page || 1;
    const perPage = limit || 50;
    const skip = (currentPage - 1) * perPage;

    // Get total count for pagination
    const total = await Brand.countDocuments(query);

    // Execute query with pagination
    const brands = await Brand.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(perPage)
        .exec();

    return {
        brands,
        total,
        page: currentPage,
        limit: perPage,
        totalPages: Math.ceil(total / perPage)
    };
};

/**
 * Get brands by multiple manufacture types
 */
export const getBrandsByMultipleManufactureTypes = async (
    manufactureTypes: string[],
    limit?: number,
    page?: number
) => {
    const query = {
        manufactureType: { $in: manufactureTypes }
    };

    // Pagination setup
    const currentPage = page || 1;
    const perPage = limit || 50;
    const skip = (currentPage - 1) * perPage;

    // Get total count for pagination
    const total = await Brand.countDocuments(query);

    // Execute query with pagination
    const brands = await Brand.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(perPage)
        .exec();

    return {
        brands,
        total,
        page: currentPage,
        limit: perPage,
        totalPages: Math.ceil(total / perPage)
    };
};

/**
 * Check if brand exists by name
 */
export const checkBrandExists = async (name: string): Promise<boolean> => {
    const brand = await Brand.findOne({ name });
    return !!brand;
};

/**
 * Get brand statistics
 */
export const getBrandStats = async () => {
    const totalBrands = await Brand.countDocuments();

    const manufactureTypeStats = await Brand.aggregate([
        { $unwind: "$manufactureType" },
        {
            $group: {
                _id: "$manufactureType",
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } }
    ]);

    const recentBrands = await Brand.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name createdAt manufactureType");

    return {
        totalBrands,
        manufactureTypeStats,
        recentBrands
    };
};

/**
 * Search brands with advanced filtering
 */
export const searchBrands = async (
    filters: {
        search?: string;
        manufactureTypes?: string[];
        page?: number;
        limit?: number;
    }
) => {
    const { search, manufactureTypes, page = 1, limit = 50 } = filters;
    const query: any = {};

    // Text search
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { parentCompany: { $regex: search, $options: "i" } }
        ];
    }

    // Manufacture type filtering
    if (manufactureTypes && manufactureTypes.length > 0) {
        query.manufactureType = { $in: manufactureTypes };
    }

    const skip = (page - 1) * limit;
    const total = await Brand.countDocuments(query);

    const brands = await Brand.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit)
        .exec();

    return {
        brands,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};