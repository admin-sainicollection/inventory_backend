import Vendor from "./vendor.model";
import { IVendor } from "./vendor.model";

export const createVendor = async (data:IVendor)=>{
    const existingVendor = await Vendor.findOne({name : data.name});
    if(existingVendor){
        throw new Error("Vendor with this name is already exists");
    }
    return await Vendor.create(data);
}

export const getAllVendors = async ()=>{
    const vendor = await Vendor.find().sort({createdAt: -1});
    if(!vendor){
        throw new Error("Vendors not found")
    }
    return vendor
}

export const getVendorById = async (id:String)=>{
    const vendor = await Vendor.findById(id);
    if(!vendor){
        throw new Error("Vendor not found");
    }
    return vendor;
}

export const updateVendor = async (id:string, data:Partial<IVendor>)=>{
    const updatedVendor = await Vendor.findByIdAndUpdate(id, data,{
        new:true
    });
    if(!updatedVendor){
        throw new Error("Vendor not found");
    }
    return updatedVendor;
}

export const deleteVendor = async (id:string)=>{
    const deletedVendor = await Vendor.findByIdAndDelete(id);
    if(!deletedVendor){
        throw new Error("Vendor not found");
    }
    return deletedVendor;
}