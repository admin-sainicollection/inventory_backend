import mongoose, { Schema, Document } from "mongoose";

export interface ICarModel extends Document {
    name: String,
    brand?: String
}

const carModelSchema = new Schema<ICarModel>(
    {
        name: { type: String, required: true, unique: true, trim: true },
        brand: { type: String }
    },
    {
        timestamps: true
    }
)

export default mongoose.model<ICarModel>("CarModel", carModelSchema)