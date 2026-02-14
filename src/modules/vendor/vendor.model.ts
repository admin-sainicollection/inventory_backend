import mongoose, { Document, Schema } from 'mongoose';
import { brandIdParamSchema } from '../brand/brand.validation';

export interface IVendor extends Document {
    vendorName: string;
    nickName?: string;
    type?: string[];
    role?:string;
    withGST?:boolean;
    contact: {
        phone: {
            label: string;
            phoneNo: string; // Changed from number to string to preserve formatting
        }[];
        email?: string[];
    };
    location: string;
    address?: {
        line1: string;
        city: string;
        state: string;
        country: string;
        pinCode: string;
    };
    brands: {
        brandName: string;
        brandLogo?: string;
    }[];
    gstNumber?: string | null;
    status: "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;
}

export const vendorSchema = new Schema<IVendor>(
    {
        vendorName: {
            type: String,
            required: true,
            trim: true
        },
        nickName: {
            type: String,
            required: false,
            trim: true
        },
        role:{
            type:String,
            trim:true,
            default:"vendor"
        },
        withGST:{
            type:Boolean,
            trim:true,
            default:true
        },
        type: [{
            type: String,
            required: false,
            trim: true
        }],
        contact: {
            phone: [{
                label: {
                    type: String,
                    required: true,
                    trim: true,
                },
                phoneNo: {
                    type: String, // Changed to String to preserve formatting
                    required: true,
                    trim: true
                }
            }],
            email: [{
                type: String,
                required: false,
                trim: true,
                lowercase: true
            }]
        },
        location: {
            type: String,
            required: true,
            trim: true
        },
        address: {
            line1: {
                type: String,
                required: false,
                trim: true
            },
            city: {
                type: String,
                required: false,
                trim: true
            },
            state: {
                type: String,
                required: false,
                trim: true
            },
            country: {
                type: String,
                required: false,
                trim: true
            },
            pinCode: {
                type: String,
                required: false,
                trim: true
            }
        },
        brands: [{
            brandName: {
                type: String,
                required: true,
                trim: true
            },
            brandLogo: {
                type: String,
                required: false,
                trim: true
            }
        }],
        gstNumber: {
            type: String,
            required: false,
            unique: false,
            trim: true,
            sparse: true,
            uppercase: true,
            default: null, // Explicitly set default to null
            validate: {
                validator: function (v: string | null) {
                    // Allow null/empty or 15-character alphanumeric
                    return v === null || v === '' || /^[0-9A-Z]{15}$/.test(v);
                },
                message: 'GST number must be 15 characters alphanumeric or empty'
            }
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        },
    },
    {
        timestamps: true
    }
);

// Index for better search performance
vendorSchema.index({ vendorName: 1 });
vendorSchema.index({ nickName: 1 });
// vendorSchema.index({ gstNumber: 1 });
vendorSchema.index({ location: 1 });
vendorSchema.index({ 'contact.email': 1 });
vendorSchema.index({ 'contact.phone.phoneNo': 1 }); // New index for phone numbers
vendorSchema.index({ 'contact.phone.label': 1 }); // New index for phone numbers
vendorSchema.index({ brands: 1 });
vendorSchema.index({ status: 1 });

export default mongoose.model<IVendor>('Vendor', vendorSchema);