import User from "../users/user.model";
import Role from "./role.model";
import { Types } from "mongoose";

export const findUserByEmail = (email: string) => User.findOne({ email });
export const findUserByUserName = (userName: string) => User.findOne({ userName });
export const findUserById = (id: string) => User.findById(id).populate("role");
export const createUser = (payload: any) => User.create(payload);
export const updateUser = (id: string, data: any) => User.findByIdAndUpdate(id, data, { new: true });
export const findRoleByName = (name: string) => Role.findOne({ name });
export const createRole = (payload: any) => Role.create(payload);
