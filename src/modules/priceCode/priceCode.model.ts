import mongoose, { Schema, Document } from "mongoose";

export interface MappingObject {
  digit: number;
  character: string;
}

export interface IPriceCode extends Document {
    digitMappings: Array<MappingObject>;
}

const priceCodeSchema = new Schema<IPriceCode>({
    digitMappings: [{
        digit: {
            type: Number,
            required: true,
            unique: true,
            min: 0,
            max: 9
        },
        character: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            maxlength: 1
        }
    }]
}, {
    timestamps: true
});

// priceCodeSchema.index({ "digitMappings.digit": 1 }, { unique: true });
priceCodeSchema.index({ "digitMappings.character": 1 }, { unique: true });

export default mongoose.model<IPriceCode>("PriceCode", priceCodeSchema);