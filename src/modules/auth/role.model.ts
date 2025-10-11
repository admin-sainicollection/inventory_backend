import mongoose, {Schema, Document} from "mongoose";
import { required } from "zod/v4/core/util.cjs";

export interface IRole extends Document{
    name:string;
    permissions: string[];
    description?: string;
}

const RoleSchema = new Schema<IRole>({
    name:{
        type:String,
        required:true,
        unique:true
    },
    permissions:[{
        type:String,
        required:true
    }],
    description:String
},{timestamps:true});

export default mongoose.model<IRole>("Role",RoleSchema)