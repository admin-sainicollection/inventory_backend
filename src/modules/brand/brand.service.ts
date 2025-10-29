import CarModel from "../inventory/compatibility/compatibility.model";
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
  const brand = await Brand.findById(id);
  if (!brand) throw new Error("Brand not found");

  // ✅ Prevent deletion if used in any car
  const usedInCar = await CarModel.findOne({ "brand.name": brand.name });
  if (usedInCar)
    throw new Error("This brand is associated with one or more cars. Please remove those cars before deleting the brand.");

  await Brand.findByIdAndDelete(id);
  return brand;
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
