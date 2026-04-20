import mongoose, { Document, Schema } from "mongoose";

export interface IBrand extends Document {
    name: string;
    parentCompany?: string;
    brandLogo?: string;
    description?:string;
    manufactureType: string[];
    createdAt: Date;
    updatedAt: Date;
}

const brandSchema = new Schema<IBrand>(
    {
        name: { type: String, required: true, trim: true },
        parentCompany: { type: String, trim: true },
        description:{type:String},
        brandLogo: { type: String, trim: true },
        manufactureType: { type: [String], required: true, enum:["Cars", "Parts"], default: [] },
    },
    { timestamps: true }
);

export default mongoose.model<IBrand>("Brand", brandSchema);
