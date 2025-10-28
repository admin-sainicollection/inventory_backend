import mongoose, { Schema, Document } from "mongoose";
import { required } from "zod/v4/core/util.cjs";

export interface ICarModel extends Document {
    name: string;
    brand: {
        name: string;
        logo?: string;
        parentCompany?: string;
    };
    baseImage?: string;
    variants: string[];
    fuelTypes: string[];
    transmissions: string[];
    generations: {
        from: string; // changed from number → string
        to: string;   // changed from number → string
        images: string[];
    }[];
}

export const carModelSchema = new Schema<ICarModel>(
    {
        name: { type: String, required: true, trim: true },
        brand: {
            name: { type: String, required: true, trim: true },
            logo: { type: String, required: true, trim: true },
            parentCompany: { type: String, trim: true },
        },
        baseImage: { type: String, required: true, trim: true },
        variants: { type: [String], required: true, default: [] },
        fuelTypes: { type: [String], required: true, default: [] },
        transmissions: { type: [String], required: true, default: [] },
        generations: [
            {
                from: { type: String, required: true, trim: true },
                to: { type: String, required: true, trim: true },
                images: { type: [String], required: true, default: [] },
            },
        ],
    },
    { timestamps: true }
);

// for efficient searching/filtering
carModelSchema.index({ name: 1, "brand.name": 1 });

export default mongoose.model<ICarModel>("CarModel", carModelSchema);
