import Brand, { IBrand } from "./brand.model";

/**
 * Create a new brand
 */
export const createBrand = async (data: Partial<IBrand>) => {
    const existing = await Brand.findOne({ name: data.name });
    if (existing) {
        throw new Error("Brand with this name already exists");
    }
    return await Brand.create(data);
};

/**
 * Update a brand by ID
 */
export const updateBrand = async (id: string, data: Partial<IBrand>) => {
    const updated = await Brand.findByIdAndUpdate(id, data, { new: true });
    if (!updated) throw new Error("Brand not found");
    return updated;
};

/**
 * Delete a brand by ID
 */
export const deleteBrand = async (id: string) => {
    const deleted = await Brand.findByIdAndDelete(id);
    if (!deleted) throw new Error("Brand not found");
    return deleted;
};

/**
 * Get all brands
 */
export const getAllBrands = async () => {
    return await Brand.find().sort({ createdAt: -1 });
};

/**
 * Get brand by ID
 */
export const getBrandById = async (id: string) => {
    const brand = await Brand.findById(id);
    if (!brand) throw new Error("Brand not found");
    return brand;
};
