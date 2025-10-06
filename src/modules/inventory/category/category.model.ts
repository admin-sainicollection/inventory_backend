import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
    name: string;
    description?: string;
}

const CategorySchema = new Schema<ICategory>({
    name: { type: String, required: true, unique: true, index: true },
    description: { type: String, trim: true }
}, {
    timestamps: true
})

export default mongoose.model<ICategory>("Category", CategorySchema)