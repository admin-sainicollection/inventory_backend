import { email, z } from 'zod';
import mongoose from 'mongoose';

// -----------------------------------------------------------------LOGIN SCHEMA
export const loginSchema = z.object({
    identifier: z.string().min(3, "Email or Username is required"),
    password: z.string().min(6, "Must contain at least 6 characters with letters and numbers"),
})

// -----------------------------------------------------------------FORGOT PASSWORD SCHEMA
export const forgotPasswordSchema = z.object({
    email: z.string().email("Enter a valid email")
})

// -----------------------------------------------------------------RESET PASSWORD SCHEMA
export const resetPasswordSchema = z.object({
    id: z.string().min(1, "User ID is required"), // you can also refine to ObjectId pattern
    token: z.string().min(1, "Reset token is required"),
    newPassword: z
        .string()
        .min(6, "Password must be at least 6 characters long")
})

// -----------------------------------------------------------------INVITE USER SCHEMA
export const inviteUserSchema = z.object({
    name: z.string().min(2, "Name is required"),
    userName: z.string().min(3, "Username is required"),
    email: z.string().email("Valid email is required"),
    phoneNumber: z.string().optional(),
    address: z
        .object({
            line1: z.string().optional(),
            line2: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            zip: z.string().optional(),
            country: z.string().optional(),
        })
        .optional(),
    role: z.string().min(1, "Role is required"),
})

// -----------------------------------------------------------------VERIFY EMAIL SCHEMA
export const verifyEmailSchema = z.object({
    id: z.string().min(1, "User ID is required"),
    token: z.string().min(1, "Verification token is required"),
})

// -----------------------------------------------------------------REFRESH TOKEN SCHEMA
export const refreshTokenSchema = z.object({
  refresh: z.string().min(1, "Refresh token is required"),
});