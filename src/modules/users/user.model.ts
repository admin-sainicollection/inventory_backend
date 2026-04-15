import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAddress {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string
}

export interface IUser extends Document<Types.ObjectId> {
    name: string;
    userName: string;
    email: string;
    password: string;
    phoneNumber?: string;
    address?: IAddress;
    role: mongoose.Types.ObjectId;
    status: "pending" | "active" | "suspended" | "deactivated" | "deleted";
    isEmailVerified: boolean;
    passwordChangedAt?: Date
}

const AddressSchema = new Schema({
    line1: String, line2: String, city: String, state: String, zip: String
}, { _id: false });

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    userName: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    phoneNumber: String,
    address: AddressSchema,
    role: { type: Schema.Types.ObjectId, ref: "Role", required: true },
    status: { type: String, enum: ["pending", "active", "suspended", "deactivated", "deleted"], default: "pending" },
    isEmailVerified: { type: Boolean, default: false },
    passwordChangedAt: Date,
}, { timestamps: true });


export default mongoose.model<IUser>("User", UserSchema);