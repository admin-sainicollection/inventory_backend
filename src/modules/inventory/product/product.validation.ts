import { z } from "zod";
import { addCarModelSchema } from "../compatibility/compatibility.validation";

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
  vendorPrice: z.number().nonnegative("Vendor price cannot be negative"),
  description: z.string(),
  compatibility: z.array(addCarModelSchema),
  attributes: z.record(z.any(), z.string()),
  status: z.enum(["active", "inactive"]),
});


export const updateProductSchema = createProductSchema.partial();