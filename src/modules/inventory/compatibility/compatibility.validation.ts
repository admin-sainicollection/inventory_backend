import {z} from "zod";

export const addCarModelSchema = z.object({
    name: z.string().min(1, "Name is required"),
    brand: z.string().optional()
})

export const updatedCarModelSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    brand: z.string().optional()
})

export const deleteCarModelSchema = z.object({
    id: z.string().min(1, "Car Model ID is required")
})  