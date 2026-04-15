import z from 'zod';

const createPriceListBaseSchemaValidation = z.object({
    partNo: z.string().trim().optional(),
    productName: z.string().trim().optional(),
    vendorName: z.string().trim().optional(),
    productBrand: z.string().trim().optional(),
    carBrand: z.string().trim().optional(),
    carModel: z.string().trim().optional(),
    mrp: z.coerce.number()
        .min(0, 'MRP cannot be negative')
        .optional()
        .or(z.literal('').transform(() => undefined)), // Handle empty strings
    purchasePrice: z.coerce.number()
        .min(0, 'Purchase price cannot be negative')
        .optional()
        .or(z.literal('').transform(() => undefined)),
    description: z.object({
        text: z.string().optional(),
        jsonFields: z.record(z.string(), z.any()).optional()
    }).optional(),
    status: z.enum(["active", "inactive"]).default("active").optional(),
    createdBy: z.string().optional()
})

export const createPriceListSchemaValidation = createPriceListBaseSchemaValidation.refine((data) => {
    // Custom validation: purchasePrice cannot be greater than MRP
    if (data.mrp !== undefined && data.purchasePrice !== undefined) {
        return data.purchasePrice <= data.mrp;
    }
    return true;
}, {
    message: "Purchase price cannot be greater than MRP",
    path: ["purchasePrice"]
});

export const updatePriceListSchemaValidation = createPriceListBaseSchemaValidation.partial();

export const bulkCreatePriceListSchemaValidation = z.object({
    entries: z.array(createPriceListSchemaValidation).min(1, "At least one entry is required")
});

// export const getAllPriceListsQuerySchemaValidation = z.object({
//     search: z.string().optional(),
//     status: z.enum(["active", "inactive"]).optional(),
//     vendorName: z.string().optional(),
//     carBrand: z.string().optional(),
//     productBrand: z.string().optional(),
//     page: z.coerce.number().min(1).default(1),
//     limit: z.coerce.number().min(1).max(100).default(10)
// });