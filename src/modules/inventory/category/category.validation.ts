import {z} from "zod";

export const createCategorySchema = z.object({
    name: z.string().min(2, "Category name must be atleast 2 charecters long"),
    aliasNames: z.array(z.string().min(1)).optional(),
    description: z.string().optional(),
    attributesTemplate: z.array(z.object({
        key: z.string().min(1, "Attribute key is required"),
        label: z.string().min(1, "Attribute label is required"),
        type: z.string().min(1, "Attribute type is required"),
        required: z.boolean().default(false),
        options: z.array(z.string()).optional()
    })).optional()
})

export const updateCategorySchema = z.object({
    name: z.string().min(2, "Category name must be atleast 2 characters long").optional(),
    aliasNames: z.array(z.string().min(1)).optional(),
    description: z.string().optional(),
    attributesTemplate: z.array(z.object({
        key: z.string().min(1, "Attribute key is required"),
        label: z.string().min(1, "Attribute label is required"),
        type: z.string().min(1, "Attribute type is required"),
        required: z.boolean().default(false),
        options: z.array(z.string()).optional()
    })).optional()
})

export const deleteCategorySchema = z.object({
    id: z.string().min(1, "Category ID is required")
})