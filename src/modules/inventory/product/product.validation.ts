import { z } from "zod";
import { addCarModelSchema } from "../compatibility/compatibility.validation";

// Zod schema for creating a product
export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),

  // aliasNames: z.array(z.string().min(1)).optional(),

  partNo: z
    .string()
    .min(1, "Part No is required")
    .transform((val) => val.toUpperCase()),

  barcode: z.string().optional(),

  productImages: z.array(z.string()).optional(),

  quantity: z
    .number({
      error: "Quantity must be a number",
    })
    .int()
    .nonnegative("Quantity cannot be negative"),

  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  vender: z.string().min(1, "Vendor is required"),

  purchasePrice: z
    .number()
    .nonnegative("Purchase price cannot be negative"),
  sellingPriceB2C: z
    .number()
    .nonnegative("Selling price to customer cannot be negative"),
  sellingPriceB2B: z
    .number()
    .nonnegative("Selling price to bussines cannot be negative"),

  description: z.string().optional(),

  // array of car model objects
  compatibility: z.array(addCarModelSchema).optional(),

  // attributes object with string keys and any type values
  attributes: z.record(z.string(), z.any()).optional(),

  status: z.enum(["active", "inactive"]).default("active"),
});

// Partial schema for updates (all optional)
export const updateProductSchema = createProductSchema.partial();
