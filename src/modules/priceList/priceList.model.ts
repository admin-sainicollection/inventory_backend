// models/PriceList.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IPriceList extends Document {
  partNo?: string;
  productName?: string;
  vendorName?: string;
  productBrand?: string;
  carBrand?: string;
  carModel?: string;
  mrp?: number;
  purchasePrice?: number;
  description?: string;
  status?: 'active' | 'inactive';
  createdBy?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const priceListSchema = new Schema<IPriceList>(
  {
    partNo: {
      type: String,
      required: false,
      trim: true,
      uppercase: true,
      index: true
    },
    productName: {
      type: String,
      required: false,
      trim: true
    },
    vendorName: {
      type: String,
      required: false,
      trim: true
    },
    productBrand: {
      type: String,
      required: false,
      trim: true
    },
    carBrand: {
      type: String,
      required: false,
      trim: true
    },
    carModel: {
      type: String,
      required: false,
      trim: true
    },
    mrp: {
      type: Number,
      required: false,
      min: [0, 'MRP cannot be negative']
    },
    purchasePrice: {
      type: Number,
      required: false,
      min: [0, 'Purchase price cannot be negative'],
      validate: {
        validator: function(this: IPriceList, value: number) {
          return this.mrp !== undefined ? value <= this.mrp : true;
        },
        message: 'Purchase price cannot be greater than MRP'
      }
    },
    description: {
      type: String,
      trim: false,
      default: ''
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt
  }
);

// Compound index for unique part numbers per vendor
priceListSchema.index({ partNo: 1, vendorName: 1 }, { unique: true });

export const PriceList = mongoose.model<IPriceList>('PriceList', priceListSchema);