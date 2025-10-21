import z from "zod";

export const vendorValidationSchema = z.object({
    name: z.string().min(1, "Vendor name is required"),
    salesPerson: z.string().min(1, "Sales person name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.coerce.string().regex(/^[6-9]\d{9}$/, "Invalid phone number"),
    address: z.object(
        {
            street: z.string().min(1, "Street is required"),
            city: z.string().min(1, "City is required"),
            state: z.string().min(1, "State is required"),
            zipCode: z.number().min(1, "Zip Code is required"),
            country: z.string().min(1, "Country is required"),
        }
    ),
    status: z.enum(["active", "inactive"]).default("active"),
})

export const vendorIdValidation = z.object({
    id: z.string().min(1, "Vendor id is required")
})