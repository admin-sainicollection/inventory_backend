import mongoose, { Document, Schema } from 'mongoose';

interface ContactPhone {
    label: string;
    phone_no: string;
}

interface AadhaarDocument {
    aadhaar_no?: number;
    aadhaar_photo_front?: string;
    aadhaar_photo_back?: string;
}

interface PanDocument {
    pan_no?: string;
    pan_photo?: string;
}

interface Documents {
    aadhaar?: AadhaarDocument;
    pan?: PanDocument;
}

export interface IEmployee extends Document {
    username:string;
    password?:string;
    role:string;
    
    first_name: string;
    last_name?: string;
    dob?: Date | string;
    gender?: string;
    photo?: string;
    contact: {
        phone: ContactPhone[];
        email?: string[];
    };
    address?: {
        line1?: string;
        city?: string;
        state?: string;
        country?: string;
        pin_code?: string;
    };
    job: {
        joining_date: string | Date;
        employee_type?: string;
        base_salary: number;
    }
    document?: Documents;
    finance: {
        bank_ac_no?: string;
        ifsc_code?: string;
    }
    userId: mongoose.Types.ObjectId | undefined;
    status: "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>({
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, trim: true },
    dob: { type: Date, trim: true }, // Changed to just Date type
    gender: { type: String, trim: true },
    photo: { type: String, trim: true },
    contact: {
        phone: [{
            label: { type: String, required: true, trim: true },
            phone_no: { type: String, required: true, trim: true }
        }],
        email: [{ type: String, trim: true }]
    },
    address: {
        line1: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, trim: true },
        pin_code: { type: String, trim: true }
    },
    job: {
        joining_date: { type: Date, required: true, trim: true }, // Changed to just Date type
        employee_type: { type: String, trim: true },
        base_salary: { type: Number, required: true, min: [0, "Base salary cannot be negative"] }
    },
    document: {
        aadhaar: {
            aadhaar_no: { 
                type: Number, 
                trim: true,
                min: [100000000000, "Aadhaar number must be 12 digits"],
                max: [999999999999, "Aadhaar number must be 12 digits"]
            },
            aadhaar_photo_front: { type: String, trim: true },
            aadhaar_photo_back: { type: String, trim: true }
        },
        pan: {
            pan_no: { 
                type: String, 
                trim: true,
                uppercase: true,
                match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN number format"] 
            },
            pan_photo: { type: String, trim: true }
        }
    },
    finance: {
        bank_ac_no: { 
            type: String, 
            trim: true,
            match: [/^\d{9,18}$/, "Bank account number should be 9-18 digits"]
        },
        ifsc_code: { 
            type: String, 
            trim: true,
            uppercase: true,
            match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"]
        }
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true }
}, {
    timestamps: true
});

// Add indexes for better search performance
EmployeeSchema.index({ first_name: 'text', last_name: 'text' });
EmployeeSchema.index({ 'contact.email': 1 });
EmployeeSchema.index({ 'contact.phone.phone_no': 1 });
EmployeeSchema.index({ 'address.city': 1, 'address.state': 1 });
EmployeeSchema.index({ 'job.employee_type': 1 });
EmployeeSchema.index({ 'job.base_salary': 1 });
// EmployeeSchema.index({ status: 1 });
EmployeeSchema.index({ gender: 1 });
EmployeeSchema.index({ dob: 1 });
EmployeeSchema.index({ createdAt: -1 });
EmployeeSchema.index({ 'document.aadhaar.aadhaar_no': 1 });
EmployeeSchema.index({ 'document.pan.pan_no': 1 });

export default mongoose.model<IEmployee>("Employee", EmployeeSchema);