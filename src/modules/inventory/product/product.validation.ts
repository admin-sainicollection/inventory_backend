import { z } from "zod";

// Zod schema for product
export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  sku: z.string().min(1, "SKU is required"),
  image: z.string().optional(), 
  quantity: z.number().int().nonnegative("Quantity cannot be negative"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  vender: z.string().min(1, "Vendor is required"),
  purchasePrice: z.number().nonnegative("Purchase price cannot be negative"),
  sellingPrice: z.number().nonnegative("Selling price cannot be negative"),
  vendorPrice: z.number().nonnegative("Vendor price cannot be negative").optional(),
  description: z.string().optional(),
  compatibility: z.array(z.string().min(1, "Compatibility name cannot be empty")).optional(),
  attributes: z.record(z.any(), z.string()).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});


export const updateProductSchema = createProductSchema.partial();