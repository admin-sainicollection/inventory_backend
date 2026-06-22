import { z } from "zod";

/**
 * ✅ Common schema for brand embedded in car model
 */
const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  logo: z.string().url("Brand logo must be a valid URL").optional(), // logo may be URL or uploaded file later
  parentCompany: z.string().optional(),
});

/**
 * ✅ Common schema for each generation
 * 'to' is optional if the generation is still current (Present)
 */
const generationSchema = z.object({
  from: z.coerce.string().min(1, "Start year is required"),
  to: z.coerce.string().optional(),
  images: z.array(z.string()).optional(),
  description:z.string().optional()
});

/**
 * ✅ Schema for adding a new car model
 * Matches your React frontend payload structure
 */
export const addCarModelSchema = z.object({
  name: z.string().min(1, "Car name is required"),
  brand: brandSchema,
  baseImage: z.string().optional(), // stored file path
  variants: z
    .array(z.string().min(1, "Variant name cannot be empty"))
    .min(1, "At least one variant is required"),
  fuelTypes: z
    .array(z.string().min(1))
    .min(1, "At least one fuel type is required"),
  transmissions: z
    .array(z.string().min(1))
    .min(1, "At least one transmission type is required"),
  generations: z
    .array(generationSchema)
    .min(1, "At least one generation is required"),
});

/**
 * ✅ Schema for updating existing car model
 * All fields optional, allows partial updates
 */
export const updateCarModelSchema = z.object({
  name: z.string().optional(),
  brand: brandSchema.partial(),
  baseImage: z.string().optional(),
  variants: z.array(z.string().min(1)).optional(),
  fuelTypes: z.array(z.string().min(1)).optional(),
  transmissions: z.array(z.string().min(1)).optional(),
  generations: z.array(generationSchema).optional(),
});

/**
 * ✅ Schema for deleting car model
 */
export const deleteCarModelSchema = z.object({
  id: z.coerce.string().min(1, "Car model ID is required"),
});
