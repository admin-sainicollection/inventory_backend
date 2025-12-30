import mongoose, { Document, Schema } from 'mongoose';

export type EntityCategory = | "PARTY" | "WALK_IN_CUSTOMER" | "REGULAR_CUSTOMER"
// export type EnquiryStatus = | "PENDING" | "RESOLVED" | ""

export interface IParty extends Document {
    partyName: string;
    nickName?: string;
    // role?: string;
    withGST?: boolean;
    entityCategory: EntityCategory;
    enquiryStatus?:string;
    enquiry?:string;
    description?:string;
    assigningEmployeeId?:string;
    // type?: string[];
    contact: {
        phone: {
            label: string;
            phoneNo: string; // Changed from number to string to preserve formatting
        }[];
        email?: string[];
    };
    location: string;
    gstNumber?: string | null;
    address?: {
        line1: string;
        city: string;
        state: string;
        country: string;
        pinCode: string;
    };
    // brands: {
    //     brandName: string;
    //     brandLogo?: string;
    // }[];
    status: "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;
}

export const partySchema = new Schema<IParty>(
    {
        partyName: {
            type: String,
            required: true,
            trim: true
        },
        nickName: {
            type: String,
            required: false,
            trim: true
        },
        // role: {
        //     type: String,
        //     trim: true,
        //     default: "party"
        // },
        entityCategory: {
            type: String,
            enum: ["PARTY","WALK_IN_CUSTOMER", "REGULAR_CUSTOMER"],
            required: true,
            default:"PARTY"
        },
        enquiryStatus:{
            type: String,
            trim:true
            // enum:["PENDING","RESOLVED",""],
            // default:"PENDING"
        },
        enquiry:{
            type:String,
            trim:true,
        },
        description:{
            type:String,
            trim:true,
        },
        assigningEmployeeId:{
            type:String,
            trim:true,
        },
        withGST: {
            type: Boolean,
            trim: true,
            default: false
        },
        // type: [{
        //     type: String,
        //     required: false,
        //     trim: true
        // }],
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
        // brands: [{
        //     brandName: {
        //         type: String,
        //         required: true,
        //         trim: true
        //     },
        //     brandLogo: {
        //         type: String,
        //         required: false,
        //         trim: true
        //     }
        // }],
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
partySchema.index({ partyName: 1 });
partySchema.index({ nickName: 1 });
partySchema.index({ entityCategory: 1 });
partySchema.index({ gstNumber: 1 });
partySchema.index({ location: 1 });
partySchema.index({ 'contact.email': 1 });
partySchema.index({ 'contact.phone.phoneNo': 1 }); // New index for phone numbers
partySchema.index({ 'contact.phone.label': 1 }); // New index for phone numbers
// partySchema.index({ brands: 1 });
partySchema.index({ status: 1 });

export default mongoose.model<IParty>('Party', partySchema);