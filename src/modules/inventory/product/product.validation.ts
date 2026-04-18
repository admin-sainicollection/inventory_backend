import { z } from "zod";
import { addCarModelSchema } from "../compatibility/compatibility.validation";

// Zod schema for creating a product
export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),

  partNo: z
    .string()
    .transform((val) => val.toUpperCase())
    .optional(),

  barcode: z.string().optional(),

  productImages: z.array(z.string()).optional(),

  quantity: z
    .number({
      error: "Quantity must be a number",
    })
    .int()
    .nonnegative("Quantity cannot be negative")
    .optional(),

  category: z.string().optional(),
  brand: z.string().optional(),
  vender: z.string().optional(),
  mrp: z
    .coerce.number()
    .nonnegative("MRP price cannot be negative")
    .optional(),
  unitPrice: z
    .coerce.number()
    .nonnegative("Unit price cannot be negative")
    .optional(),
  purchaseDiscount: z
    .coerce.number()
    .nonnegative("Purchase discount cannot be negative")
    .optional(),
  purchasePrice: z
    .coerce.number()
    .nonnegative("Purchase price cannot be negative")
    .optional(),
  discountB2C: z
    .coerce.number()
    .nonnegative("B2C discount cannot be negative")
    .optional(),
  sellingPriceB2C: z
    .coerce.number()
    .nonnegative("Selling price to customer cannot be negative")
    .optional(),
  discountB2B: z
    .coerce.number()
    .nonnegative("B2B discount cannot be negative")
    .optional(),
  sellingPriceB2B: z
    .coerce.number()
    .nonnegative("Selling price to business cannot be negative")
    .optional(),

  description: z.object({
    text: z.string().optional(),
    jsonFields: z.record(z.string(), z.any()).optional()
  }).optional(),

  compatibility: z.array(addCarModelSchema).optional(),

  attributes: z.record(z.string(), z.any()).optional(),

  source: z.object({
    type: z.enum(['manual', 'price-list', 'oem', 'oes', 'import', 'lot']).default('manual').optional(),
    id: z.string().optional(),
    date: z.date().optional().default(() => new Date()),
    metadata: z.record(z.string(), z.any()).optional()
  }).optional(),

  importBatchId: z.string().optional(),

  status: z.enum(["active", "inactive"]).default("active"),
});

// Partial schema for updates (all optional)
export const updateProductSchema = createProductSchema.partial();
