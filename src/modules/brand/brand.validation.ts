import z from "zod";

export const brandValidationSchema = z.object({
    name: z.string().min(1, "Brand name is required").max(100, "Brand name is too long"),
    parentCompany: z.string().max(100, "Parent company name is too long").optional(),
    manufactureType: z.union([
        z.string().min(1, "Manufacture type is required"),
        z.array(z.string().min(1, "Manufacture type cannot be empty"))
    ])
});

export const brandUpdateValidationSchema = z.object({
    name: z.string().min(1, "Brand name is required").max(100, "Brand name is too long").optional(),
    parentCompany: z.string().max(100, "Parent company name is too long").optional(),
    manufactureType: z.union([
        z.string().min(1, "Manufacture type is required"),
        z.array(z.string().min(1, "Manufacture type cannot be empty"))
    ]).optional()
});

export const brandIdParamSchema = z.object({
    id: z.string().min(1, "Brand ID is required")
});