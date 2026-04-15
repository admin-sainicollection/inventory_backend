import mongoose, {Schema, Document} from "mongoose";

export interface IRole extends Document{
    name:string;
    permissions?: string[];
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
    }],
    description:String
},{timestamps:true});

export default mongoose.model<IRole>("Role",RoleSchema)