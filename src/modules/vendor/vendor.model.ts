import mongoose, { Document, Schema } from 'mongoose';

export interface IVendor extends Document {
    name: string;
    salesPerson: string;
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: number;
        country: string;
    };
    status: "active" | "inactive";
}

export const venderSchema = new Schema<IVendor>(
    {
        name: { type: String, required: true, trim: true },
        salesPerson: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        address: {
            street: { type: String, required: true, trim: true },
            city: { type: String, required: true, trim: true },
            state: { type: String, required: true, trim: true },
            zipCode: { type: Number, required: true, trim: true },
            country: { type: String, required: true, trim: true },
        },
        status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true }
)

export default mongoose.model<IVendor>('Vendor', venderSchema);