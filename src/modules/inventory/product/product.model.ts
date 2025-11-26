import mongoose, { Schema, Document } from "mongoose";
import { ICarModel, carModelSchema } from "../compatibility/compatibility.model";

export interface IProduct extends Document {
  name: string;
//   aliasNames?: string[]; // alternate searchable names
  partNo: string;
  barcode?: string; // optional barcode
  productImages?: string[];
  quantity: number;
  category: string;
  brand: string;
  vender: string;
  mrp:number;
  purchaseDiscount:number;
  purchasePrice: number;
  sellingPriceB2C: number;
  sellingPriceB2B: number;
  description?: string;
  compatibility: ICarModel[];
  attributes?: Record<string, any>;
  status?: "active" | "inactive";
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    // aliasNames: {
    //   type: [String],
    //   trim: true,
    //   default: [],
    // },
    partNo: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    barcode: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // allows multiple null/undefined values
    },
    productImages: { type: [String] },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Quantity cannot be negative"],
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    vender: {
      type: String,
      required: true,
      trim: true,
    },
    mrp:{
        type:Number,
        required: true,
        trim:true
    },
    purchaseDiscount:{
        type:Number,
        required:true,
        trim:true
    },
    purchasePrice: {
      type: Number,
      required: true,
      min: [0, "Purchase price cannot be negative"],
    },
    sellingPriceB2C: {
      type: Number,
      required: true,
      min: [0, "Selling price cannot be negative"],
    },
    sellingPriceB2B: {
      type: Number,
      required: true,
      min: [0, "Vendor price cannot be negative"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    compatibility: {
      type: [carModelSchema],
      default: [],
    },
    attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

// 🔹 Indexes for performance
productSchema.index({ category: 1, brand: 1, createdAt: -1 });
productSchema.index({ name: "text", aliasNames: "text", brand: "text" }); // enables text search

export default mongoose.model<IProduct>("Product", productSchema);
