import z from "zod";

export const partyValidationSchema = z.object({
    partyName: z.string().min(1, "Party name is required").trim(),
    nickName: z.string().optional(),
    // role: z.string().optional().default("party"),
    withGST: z.boolean().optional().default(false),
    entityCategory: z.enum(["PARTY", "WALK_IN_CUSTOMER", "REGULAR_CUSTOMER"]).default("PARTY"),
    // enquiryStatus: z.enum(["PENDING", "RESOLVED"]).optional().default("PENDING"),
    enquiryStatus: z.string().optional(),
    enquiry: z.string().optional(),
    description: z.string().optional(),
    assigningEmployeeId: z.string().optional(),
    // type: z.array(z.string().trim()).min(1, "At least one type is required"),
    contact: z.object({
        phone: z.array(
            z.object({
                label: z.string().min(1, "Phone label is required").trim(),
                phoneNo: z.string()
                    .min(1, "Phone number is required")
                    .regex(/^[6-9]\d{9}$/, "Invalid Indian phone number format")
            })
        ).min(1, "At least one phone number is required"),
        email: z.array(
            z.string().email("Invalid email address").toLowerCase().trim()
        ).optional().default([]),
    }),
    location: z.string().min(1, "Location is required").trim(),
    address: z.object({
        line1: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        pinCode: z.string().optional(),
    }).optional().default({}),
    // brands: z.array(
    //     z.object({ // Fixed: added z.object wrapper
    //         brandName: z.string().min(1, "Brand name cannot be empty").trim(),
    //         brandLogo: z.string().optional() // Added to match Mongoose schema
    //     })
    // ).min(1, "At least one brand is required"),
    gstNumber: z.string()
        .regex(/^$|^[0-9A-Z]{15}$/, "GST number must be 15 characters alphanumeric or empty")
        .optional()
        .transform(val => {
            // Handle empty string, undefined, or null
            if (!val || val.trim() === '') {
                return null;
            }
            return val.toUpperCase();
        })
        .nullable()
        .default(null),
    status: z.enum(["active", "inactive"]).default("active"),
});

export const partyIdValidation = z.object({
    id: z.string().min(1, "Party id is required")
});

export const partyUpdateValidationSchema = partyValidationSchema.partial();

export const partyQueryValidation = z.object({
    search: z.string().optional(),
    status: z.enum(["active", "inactive"]).optional(),
    // type: z.string().optional(),
    location: z.string().optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().optional().default(50),
});

// Additional validation schemas for phone and email management
export const addPhoneValidationSchema = z.object({
    label: z.string().min(1, "Phone label is required").trim(),
    phoneNo: z.string()
        .min(1, "Phone number is required")
        .regex(/^[6-9]\d{9}$/, "Invalid Indian phone number format")
});

export const addEmailValidationSchema = z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim()
});

export const phoneIndexValidation = z.object({
    vendorId: z.string().min(1, "Vendor ID is required"),
    phoneIndex: z.coerce.number().int().nonnegative("Phone index must be a valid number")
});

export const emailIndexValidation = z.object({
    vendorId: z.string().min(1, "Vendor ID is required"),
    emailIndex: z.coerce.number().int().nonnegative("Email index must be a valid number")
});