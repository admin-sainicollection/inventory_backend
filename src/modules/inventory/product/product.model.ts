import mongoose, { Schema, Document } from "mongoose";
import { ICarModel, carModelSchema } from "../compatibility/compatibility.model";

interface IDescription {
  text?: string;
  jsonFields?: Record<string, any>; // Dynamic key-value pairs
}

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
  mrp: number;
  purchaseDiscount: number;
  purchasePrice: number;
  sellingPriceB2C: number;
  sellingPriceB2B: number;
  description?: IDescription;
  compatibility: ICarModel[];
  attributes?: Record<string, any>;
  status?: "active" | "inactive";
  source: {
    type: string;
    id?: string;
    date: Date;
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
    mrp: {
      type: Number,
      required: true,
      trim: true
    },
    purchaseDiscount: {
      type: Number,
      required: true,
      trim: true
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
          enum: ['manual', 'price-list', 'import', 'api'],
          default: "manual",
          required: true
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
productSchema.index({'source.type':1});
// productSchema.index({'source.id': 1});
// productSchema.index({importBatchId: 1})

export default mongoose.model<IProduct>("Product", productSchema);
