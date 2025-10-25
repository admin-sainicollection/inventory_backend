import z from "zod";

export const brandValidationSchema = z.object({
    name: z.string().min(1, "Brand name is required"),
    parentCompany: z.string().optional(),
    // brandLogo: z.string().url("Logo must be a valid URL").optional(),
});
