import { z } from "zod";

// Validation for adding a new car model
export const addCarModelSchema = z.object({
    name: z.string().min(1, "Name is required"),
    brand: z.string().min(1, "Brand Name is required"),
    variants: z.array(z.string()).min(1, "At least one variant is required"),
    fuelType: z.array(z.string()).min(1, "At least one fuel type is required"),
    year: z.array(z.object({ from: z.number(), to: z.number() })).min(1, "At least one year range is required"),
    transmission: z.array(z.string()).min(1, "At least one transmission type is required")
});

// Validation for updating an existing car model
export const updateCarModelSchema = z.object({
    name: z.string().min(1, "Name is required"),
    brand: z.string().min(1, "Brand Name is required"),
    variants: z.array(z.string()).min(1, "At least one variant is required"),
    fuelType: z.array(z.string()).min(1, "At least one fuel type is required"),
    year: z.array(z.object({ from: z.number(), to: z.number() })).min(1, "At least one year range is required"),
    transmission: z.array(z.string()).min(1, "At least one transmission type is required")
});

// Validation for deleting a car model
export const deleteCarModelSchema = z.object({
    id: z.string().min(1, "Car Model ID is required")
});
