import mongoose, { Schema, Document } from "mongoose";

export interface ICarModel extends Document {
    name: string;
    brand: string;
    variants: string[];
    fuelType: string[];
    year: { from: number; to: number }[];
    transmission: string[];
}

export const carModelSchema = new Schema<ICarModel>(
    {
        name: { type: String, required: true, trim: true },
        brand: { type: String, required: true, trim: true },
        variants: { type: [String], default: [] },
        fuelType: { type: [String], default: [] },
        year: [
            {
                from: { type: Number, required: true },
                to: { type: Number, required: true },
            },
        ],
        transmission: { type: [String], default: [] },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ICarModel>("CarModel", carModelSchema);
