import Party, { IParty } from "./party.model";

export const createParty = async (data: IParty) => {
    // Check for duplicate vendor name
    const existingParty = await Party.findOne({ partyName: data.partyName });
    if (existingParty) {
        throw new Error("Party with this name already exists");
    }

    // // Process GST number
    const processedGst = data.gstNumber && data.gstNumber.trim() !== ''
        ? data.gstNumber.trim().toUpperCase()
        : null;

    // // Check for duplicate GST number only if provided
    if (processedGst) {
        const existingGST = await Party.findOne({
            gstNumber: processedGst
        });
        if (existingGST) {
            throw new Error("Vendor with this GST number already exists");
        }
    }

    // Prepare data for creation
    const partyData = {
        ...data,
        gstNumber: processedGst
    };

    return await Party.create(partyData);
}

export const updateParty = async (id: string, data: Partial<IParty>) => {
    // Check if vendor exists
    const existingParty = await Party.findById(id);
    if (!existingParty) {
        throw new Error("Party not found");
    }

    // If partyName is being updated, check for duplicates
    if (data.partyName && data.partyName !== existingParty.partyName) {
        const duplicateParty = await Party.findOne({
            partyName: data.partyName,
            _id: { $ne: id }
        });
        if (duplicateParty) {
            throw new Error("Party with this name already exists");
        }
    }

    // // Process GST number if provided
    if (data.gstNumber !== undefined) {
        const processedGst = data.gstNumber && data.gstNumber.trim() !== ''
            ? data.gstNumber.trim().toUpperCase()
            : null;

        // Check for duplicate GST number only if it's a new non-empty value
        if (processedGst && processedGst !== existingParty.gstNumber) {
            const duplicateGST = await Party.findOne({
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

    const updated = await Party.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
    );

    if (!updated) throw new Error("Party not found");
    return updated;
}

export const getAllParties = async (q?: string, entityCategory?: string, page?: number, limit?: number) => {
    let query = {};

    // Search across all fields if q parameter is provided
    if (q && q.trim() !== '') {
        const searchRegex = new RegExp(q, 'i');

        query = {
            $or: [
                { partyName: { $regex: searchRegex } },
                { nickName: { $regex: searchRegex } },
                { entityCategory: { $regex: searchRegex } },
                // { type: { $in: [searchRegex] } },
                { 'contact.phone.phoneNo': { $regex: searchRegex } },
                { 'contact.phone.label': { $regex: searchRegex } },
                { 'contact.email': { $regex: searchRegex } },
                { location: { $regex: searchRegex } },
                // { 'brands.brandName': { $in: [searchRegex] } },
                // { gstNumber: { $regex: searchRegex } },
                { 'address.line1': { $regex: searchRegex } },
                { 'address.city': { $regex: searchRegex } },
                { 'address.state': { $regex: searchRegex } },
                { 'address.country': { $regex: searchRegex } },
                { 'address.pinCode': { $regex: searchRegex } },
            ]
        };
    }

    // Add customer type filter if provided and not "ALL"
    if (entityCategory && entityCategory !== 'ALL') {
        // If query already exists (from search), add entityCategory to it
        if (Object.keys(query).length > 0) {
            query = {
                ...query,
                entityCategory: entityCategory
            };
        } else {
            query = { entityCategory: entityCategory };
        }
    }

    // Pagination setup
    const currentPage = page || 1;
    const perPage = limit || 50;
    const skip = (currentPage - 1) * perPage;

    // Get total count for pagination
    const total = await Party.countDocuments(query);

    // Execute query with pagination
    const parties = await Party.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .exec();

    // if (!parties || parties.length === 0) {
    //     throw new Error("parties not found");
    // }

    return {
        parties,
        total,
        page: currentPage,
        limit: perPage,
        totalPages: Math.ceil(total / perPage)
    };
};

export const getPartyById = async (id: string) => {
    const party = await Party.findById(id);
    if (!party) {
        throw new Error("Party not found");
    }
    return party;
}


export const deleteParty = async (id: string) => {
    const deletedParty = await Party.findByIdAndDelete(id);
    if (!deletedParty) {
        throw new Error("Party not found");
    }
    return deletedParty;
}

// Additional utility functions for phone number management
export const addPhoneToParty = async (partyId: string, phoneData: { label: string; phoneNo: string }) => {
    const party = await Party.findByIdAndUpdate(
        partyId,
        { $push: { 'contact.phone': phoneData } },
        { new: true }
    );

    if (!party) {
        throw new Error("Party not found");
    }

    return party;
}

export const removePhoneFromParty = async (partyId: string, phoneIndex: number) => {
    const party = await Party.findById(partyId);
    if (!party) {
        throw new Error("Party not found");
    }

    // Remove the phone at the specified index
    party.contact.phone.splice(phoneIndex, 1);
    await party.save();

    return party;
}

export const addEmailToParty = async (partyId: string, email: string) => {
    const party = await Party.findByIdAndUpdate(
        partyId,
        { $push: { 'contact.email': email.toLowerCase() } },
        { new: true }
    );

    if (!party) {
        throw new Error("Party not found");
    }

    return party;
}

export const removeEmailFromParty = async (partyId: string, emailIndex: number) => {
    const party = await Party.findById(partyId);
    if (!party) {
        throw new Error("Party not found");
    }

    // Remove the email at the specified index
    party.contact.email?.splice(emailIndex, 1);
    await party.save();

    return party;
}