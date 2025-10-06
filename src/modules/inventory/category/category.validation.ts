import {z} from "zod";

export const createCategorySchema = z.object({
    name: z.string().min(2, "Category name must be atleast 2 charecters long"),
    description: z.string().optional()
})