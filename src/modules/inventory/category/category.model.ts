import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
    name: string;
    description?: string;
    attributesTemplate?:{
        key:string,
        label:string,
        type:string,
        options?:string[]
    }[];
}

const CategorySchema = new Schema<ICategory>({
    name: { type: String, required: true, unique: true, index: true },
    description: { type: String, trim: true },
    attributesTemplate:[{
        key:{type:String, require:true},
        label:{type:String, require:true},
        type:{type:String, require:true},
        options:[String]
    }]
}, {
    timestamps: true
})

export default mongoose.model<ICategory>("Category", CategorySchema)