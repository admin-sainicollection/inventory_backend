import mongoose, { Document, Schema } from "mongoose";

export interface IBrand extends Document {
    name: string;
    parentCompany?: string;
    brandLogo?: string;
    createdAt: Date;
    updatedAt: Date;
}

const brandSchema = new Schema<IBrand>(
    {
        name: { type: String, required: true, trim: true },
        parentCompany: { type: String, trim: true },
        brandLogo: { type: String, trim: true },
    },
    { timestamps: true }
);

export default mongoose.model<IBrand>("Brand", brandSchema);
