import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
    name: string;
    sku: string;
    image?: string;
    quantity: number;
    category: string; // store category name
    brand: string;
    vender: string;
    purchasePrice: number;
    sellingPrice: number;
    vendorPrice: number;
    description?: string;
    compatibility: string[]; // store array of car model names
    attributes?: Record<string, any>;
    status?: "active" | "inactive";
}

const productSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true, trim: true },
        sku: { type: String, required: true, unique: true, trim: true },
        image: { type: String },
        quantity: { type: Number, required: true, default: 0 },
        category: { type: String, required: true, trim: true },
        brand: { type: String, required: true, trim: true },
        vender: { type: String, required: true, trim: true },
        purchasePrice: { type: Number, required: true },
        sellingPrice: { type: Number, required: true },
        vendorPrice: { type: Number, required: true },
        description: { type: String, trim: true },
        compatibility: [{ type: String, trim: true }],
        attributes: { type: Schema.Types.Mixed , default: {} },
        status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true }
);

export default mongoose.model<IProduct>("Product", productSchema);
