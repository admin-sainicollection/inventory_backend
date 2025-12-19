import { z } from "zod";
import { addCarModelSchema } from "../compatibility/compatibility.validation";

// Zod schema for creating a product
export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),

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
  mrp: z
    .coerce.number()
    .nonnegative("MRP price cannot be negative"),
  purchaseDiscount: z
    .coerce.number()
    .nonnegative("Purchase discount cannot be negative"),
  purchasePrice: z
    .coerce.number()
    .nonnegative("Purchase price cannot be negative"),
  sellingPriceB2C: z
    .coerce.number()
    .nonnegative("Selling price to customer cannot be negative"),
  sellingPriceB2B: z
    .coerce.number()
    .nonnegative("Selling price to business cannot be negative"),

  description: z.object({
    text: z.string().optional(),
    jsonFields: z.record(z.string(), z.any()).optional()
  }).optional(),

  compatibility: z.array(addCarModelSchema).optional(),

  attributes: z.record(z.string(), z.any()).optional(),

  source: z.object({
    type: z.enum(['manual', 'price-list', 'import', 'api']).default('manual'),
    id: z.string().optional(),
    date: z.date().optional().default(() => new Date()),
    metadata: z.record(z.string(), z.any()).optional()
  }).optional(),

  importBatchId: z.string().optional(),

  status: z.enum(["active", "inactive"]).default("active"),
});

// Partial schema for updates (all optional)
export const updateProductSchema = createProductSchema.partial();
