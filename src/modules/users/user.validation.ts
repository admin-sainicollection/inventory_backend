import {z} from "zod";
import mongoose from 'mongoose';

export const addressSchema = z.object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.coerce.string().optional(),
    country: z.string().optional()
});

// -----------------------------------------------------------------REGISTER USER SCHEMA
export const registerUserSchema = z.object({
    name: z.string().min(1, "Enter Full Name"),
    userName: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6,"Password must be at least 6 characters long"),
    phoneNumber: z.coerce.string().optional(),
    address: addressSchema.optional(),
    role: z.string().refine((val)=> mongoose.Types.ObjectId.isValid(val),{message: "Invalid role ObjectId"}),
    status: z.enum(["pending", "active", "suspended", "deactivated", "deleted"]).optional(),
    isEmailVerified: z.boolean().optional()
})