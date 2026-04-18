import mongoose, { Schema, Document } from "mongoose";
import { ICarModel, carModelSchema } from "../compatibility/compatibility.model";

interface IDescription {
  text?: string;
  jsonFields?: Record<string, any>; // Dynamic key-value pairs
}

export interface IProduct extends Document {
  name: string;
  //   aliasNames?: string[]; // alternate searchable names
  partNo?: string;
  barcode?: string; // optional barcode
  productImages?: string[];
  quantity?: number;
  category?: string;
  brand?: string;
  vender?: string;
  mrp?: number;
  unitPrice?:number;
  purchaseDiscount?: number;
  purchasePrice?: number;
  discountB2C?:number;
  sellingPriceB2C?: number;
  discountB2B?:number;
  sellingPriceB2B?: number;
  description?: IDescription;
  compatibility?: ICarModel[];
  attributes?: Record<string, any>;
  status?: "active" | "inactive";
  source?: {
    type?: string;
    id?: string;
    date?: Date;
    metadata?: Record<string, any>;
  };
  importBatchId?: string;
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
      unique: true,
      trim: true,
      uppercase: true,
      set: (v: string) => v === "" ? undefined : v,
    },
    barcode: {
      type: String,
      trim: true,
      sparse: true,
      set: (v: string) => v === "" ? undefined : v,
    },
    productImages: { type: [String] },
    quantity: {
      type: Number,
      default: 0,
      min: [0, "Quantity cannot be negative"],
    },
    category: {
      type: String,
      trim: true,
      index: true,
    },
    brand: {
      type: String,
      trim: true,
      index: true,
    },
    vender: {
      type: String,
      trim: true,
    },
    mrp: {
      type: Number,
      trim: true
    },
    unitPrice: {
      type: Number,
      trim: true
    },
    purchaseDiscount: {
      type: Number,
      trim: true
    },
    purchasePrice: {
      type: Number,
      min: [0, "Purchase price cannot be negative"],
    },
    discountB2C: {
      type: Number,
      trim:true
    },
    sellingPriceB2C: {
      type: Number,
      min: [0, "Selling price cannot be negative"],
    },
    discountB2B: {
      type: Number,
      trim:true
    },
    sellingPriceB2B: {
      type: Number,
      min: [0, "Vendor price cannot be negative"],
    },
    description: {
      type: {
        text: {
          type: String,
          trim: true,
          default: ''
        },
        jsonFields: {
          type: Schema.Types.Mixed, // Allows any JSON object
          default: {}
        }
      },
      default: () => ({}) // Default to empty object
    },
    compatibility: {
      type: [carModelSchema],
      default: [],
    },
    attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    source: {
      type: {
        type: String,
        enum: ['manual', 'price-list', 'oem', 'oes', 'import', 'lot'],
        default: "manual",
      },
      id: {
        type: String,
        sparse: true
      },
      date: {
        type: Date,
        default: Date.now
      },
      metadata: {
        type: Schema.Types.Mixed,
        default: {}
      }

    },
    importBatchId: {
      type: String,
      sparse: true,
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
productSchema.index({ 'source.type': 1 });
// productSchema.index({'source.id': 1});
// productSchema.index({importBatchId: 1})

export default mongoose.model<IProduct>("Product", productSchema);
