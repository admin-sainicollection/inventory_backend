import Vendor from "./vendor.model";
import { IVendor } from "./vendor.model";

export const createVendor = async (data: IVendor) => {
    // Check for duplicate vendor name
    const existingVendor = await Vendor.findOne({ vendorName: data.vendorName });
    if (existingVendor) {
        throw new Error("Vendor with this name already exists");
    }

    // Process GST number
    const processedGst = data.gstNumber && data.gstNumber.trim() !== ''
        ? data.gstNumber.trim().toUpperCase()
        : null;

    // Check for duplicate GST number only if provided
    if (processedGst) {
        const existingGST = await Vendor.findOne({
            gstNumber: processedGst
        });
        if (existingGST) {
            throw new Error("Vendor with this GST number already exists");
        }
    }

    // Prepare data for creation
    const vendorData = {
        ...data,
        gstNumber: processedGst
    };

    return await Vendor.create(vendorData);
}

export const updateVendor = async (id: string, data: Partial<IVendor>) => {
    // Check if vendor exists
    const existingVendor = await Vendor.findById(id);
    if (!existingVendor) {
        throw new Error("Vendor not found");
    }

    // If vendorName is being updated, check for duplicates
    if (data.vendorName && data.vendorName !== existingVendor.vendorName) {
        const duplicateVendor = await Vendor.findOne({
            vendorName: data.vendorName,
            _id: { $ne: id }
        });
        if (duplicateVendor) {
            throw new Error("Vendor with this name already exists");
        }
    }

    // Process GST number if provided
    if (data.gstNumber !== undefined) {
        const processedGst = data.gstNumber && data.gstNumber.trim() !== ''
            ? data.gstNumber.trim().toUpperCase()
            : null;

        // Check for duplicate GST number only if it's a new non-empty value
        if (processedGst && processedGst !== existingVendor.gstNumber) {
            const duplicateGST = await Vendor.findOne({
                gstNumber: processedGst,
                _id: { $ne: id }
            });
            if (duplicateGST) {
                throw new Error("Vendor with this GST number already exists");
            }
        }

        // Update the data with processed GST
        data.gstNumber = processedGst;
    }

    const updated = await Vendor.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
    );

    if (!updated) throw new Error("Vendor not found");
    return updated;
}

export const getAllVendors = async (q?: string, page?: number, limit?: number) => {
    let query = {};

    // Search across all fields if q parameter is provided
    if (q && q.trim() !== '') {
        const searchRegex = new RegExp(q, 'i');

        query = {
            $or: [
                { vendorName: { $regex: searchRegex } },
                { nickName: { $regex: searchRegex } },
                { type: { $in: [searchRegex] } },
                { 'contact.phone.phoneNo': { $regex: searchRegex } }, 
                { 'contact.phone.label': { $regex: searchRegex } },   
                { 'contact.email': { $regex: searchRegex } },  
                { location: { $regex: searchRegex } },
                { 'brands.brandName': { $in: [searchRegex] } },
                { gstNumber: { $regex: searchRegex } },
                { 'address.line1': { $regex: searchRegex } },
                { 'address.city': { $regex: searchRegex } },
                { 'address.state': { $regex: searchRegex } },
                { 'address.country': { $regex: searchRegex } },
                { 'address.pinCode': { $regex: searchRegex } },
            ]
        };
    }

    // Pagination setup
    const currentPage = page || 1;
    const perPage = limit || 50;
    const skip = (currentPage - 1) * perPage;

    // Get total count for pagination
    const total = await Vendor.countDocuments(query);

    // Execute query with pagination
    const vendors = await Vendor.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .exec();

    // if (!vendors || vendors.length === 0) {
    //     throw new Error("Vendors not found");
    // }

    return {
        vendors,
        total,
        page: currentPage,
        limit: perPage,
        totalPages: Math.ceil(total / perPage)
    };
}

export const getVendorById = async (id: string) => {
    const vendor = await Vendor.findById(id);
    if (!vendor) {
        throw new Error("Vendor not found");
    }
    return vendor;
}


export const deleteVendor = async (id: string) => {
    const deletedVendor = await Vendor.findByIdAndDelete(id);
    if (!deletedVendor) {
        throw new Error("Vendor not found");
    }
    return deletedVendor;
}

// Additional utility functions for phone number management
export const addPhoneToVendor = async (vendorId: string, phoneData: { label: string; phoneNo: string }) => {
    const vendor = await Vendor.findByIdAndUpdate(
        vendorId,
        { $push: { 'contact.phone': phoneData } },
        { new: true }
    );

    if (!vendor) {
        throw new Error("Vendor not found");
    }

    return vendor;
}

export const removePhoneFromVendor = async (vendorId: string, phoneIndex: number) => {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
        throw new Error("Vendor not found");
    }

    // Remove the phone at the specified index
    vendor.contact.phone.splice(phoneIndex, 1);
    await vendor.save();

    return vendor;
}

export const addEmailToVendor = async (vendorId: string, email: string) => {
    const vendor = await Vendor.findByIdAndUpdate(
        vendorId,
        { $push: { 'contact.email': email.toLowerCase() } },
        { new: true }
    );

    if (!vendor) {
        throw new Error("Vendor not found");
    }

    return vendor;
}

export const removeEmailFromVendor = async (vendorId: string, emailIndex: number) => {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
        throw new Error("Vendor not found");
    }

    // Remove the email at the specified index
    vendor.contact.email?.splice(emailIndex, 1);
    await vendor.save();

    return vendor;
}