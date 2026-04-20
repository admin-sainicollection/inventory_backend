import mongoose, { Types } from "mongoose";
import { useFinancialYear } from "../../utils/useFinancialYear";
import { ProductReturn } from "./productReturn.model";
import { CreateProductReurn, FilterOptions, IProductReturn, IStatusActivity, IStatusNote, Status } from "./types";
const financialYear = useFinancialYear();

// ================================================================================= HELPER FUNCTIONS
const buildProductReturnAggregation = (
    matchQuery: any,
    search?: string,
) => {
    const pipeline: any[] = [];

    if (Object.keys(matchQuery).length > 0) {
        pipeline.push({ $match: matchQuery });
    }

    pipeline.push({
        $lookup: {
            from: "parties",
            localField: "party",
            foreignField: "_id",
            as: "party"
        }
    });

    pipeline.push({
        $unwind: {
            path: "$party",
            preserveNullAndEmptyArrays: true
        }
    });

    pipeline.push({
        $lookup: {
            from: "vendors",
            localField: "vendor",
            foreignField: "_id",
            as: "vendor"
        }
    });

    pipeline.push({
        $unwind: {
            path: "$vendor",
            preserveNullAndEmptyArrays: true
        }
    });

    if (search?.trim()) {
        const regex = new RegExp(search, "i");

        pipeline.push({
            $match: {
                $or: [
                    { productReturnNumber: regex },
                    { "party.partyName": regex },
                    { "party.nickName": regex },
                    { "party.gstNumber": regex },
                    { "vendor.vendorName": regex },
                    { "items.itemName": regex },
                ]
            }
        });
    }

    pipeline.push({ $sort: { productReturnDate: -1 } });

    return pipeline;
};

const formatResponse = (result: any[], page: number, limit: number) => {
    const data = result[0]?.data || [];
    const total = result[0]?.totalCount[0]?.count || 0;

    return {
        data,
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit)
    };
};

// Helper function for date ranges
const getDateRangeQuery = (dateRange: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

    switch (dateRange) {
        case 'today':
            return { $gte: today, $lt: tomorrow };
        case 'yesterday':
            return { $gte: yesterday, $lt: today };
        case 'this_week':
            return { $gte: startOfWeek, $lt: tomorrow };
        case 'this_month':
            return { $gte: startOfMonth, $lt: tomorrow };
        case 'last_month':
            return { $gte: startOfLastMonth, $lte: endOfLastMonth };
        default:
            return null;
    }
};


// ============================================================================================= SERVICES
export const createProductReturn = async (data: CreateProductReurn) => {
    try {
        if (!data.productReturnNumber) {
            data.productReturnNumber = await getNextProductReturnNumber();
        }

        const [existingProductReturn] = await Promise.all([
            ProductReturn.findOne({ productReturnNumber: data.productReturnNumber })
        ]);

        if (existingProductReturn) {
            throw new Error("Product return number already exists")
        }

        // Create initial status history entry
        const initialStatusActivity: IStatusActivity = {
            from_status: undefined,
            to_status: data.status || 'RETURN_CREATED',
            note: data.status_note || '',
            changed_at: new Date(),
            is_initial: true
        };

        // Create initial status note entry
        const initialStatusNote: IStatusNote = {
            previous_status: undefined,
            current_status: data.status || 'RETURN_CREATED',
            note: data.status_note || 'Product return created',
            created_at: new Date()
        };

        // Add history and notes to the data
        const productReturnData = {
            ...data,
            status_history: [initialStatusActivity],
            status_notes: [initialStatusNote]
        };

        return await ProductReturn.create(productReturnData);
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export const updateProductReturn = async (id: string, data: Partial<CreateProductReurn>) => {
    try {
        const productReturn = await ProductReturn.findById(id);

        if (!productReturn) {
            throw new Error("Product return not found");
        }

        // Check if status is being updated
        if (data.status && data.status !== productReturn.status) {
            // Create status history entry
            const statusActivity: IStatusActivity = {
                from_status: productReturn.status as Status,
                to_status: data.status,
                note: data.status_note || '',
                changed_at: new Date(),
                is_initial: false
            };

            // Create status note entry
            const statusNote: IStatusNote = {
                previous_status: productReturn.status,
                current_status: data.status,
                note: data.status_note || '',
                created_at: new Date()
            };

            // Update with both status change and history/notes
            const updatedReturn = await ProductReturn.findByIdAndUpdate(
                id,
                {
                    ...data,
                    $push: {
                        status_history: statusActivity,
                        status_notes: statusNote
                    }
                },
                { new: true }
            ).populate('party vendor');

            return updatedReturn;
        }

        // No status change, just update other fields
        const updatedReturn = await ProductReturn.findByIdAndUpdate(
            id,
            data,
            { new: true }
        ).populate('party vendor');

        return updatedReturn;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getAllProductReturn = async (filters: FilterOptions = {}) => {
    try {
        const {
            limit = 1000000,
            page = 1,
            search,
            status,
            startDate,
            endDate,
            dateRange,
            partyId,
            vendorId
        } = filters;

        const query: any = {};

        if (status && status !== "all") {
            query.status = status;
        }

        if (partyId) {
            // query.party = partyId;
            query.party = new mongoose.Types.ObjectId(partyId)
        }

        if (vendorId) {
            // query.party = partyId;
            query.vendor = new mongoose.Types.ObjectId(vendorId)
        }

        if (dateRange && dateRange !== "all" && dateRange !== "custom") {
            const dateQuery = getDateRangeQuery(dateRange);
            if (dateQuery) query.productReturnDate = dateQuery;
        } else if (startDate || endDate) {
            const dq: any = {};
            if (startDate) {
                const s = new Date(startDate);
                s.setHours(0, 0, 0, 0);
                dq.$gte = s;
            }
            if (endDate) {
                const e = new Date(endDate);
                e.setHours(23, 59, 59, 999);
                dq.$lte = e;
            }
            query.productReturnDate = dq;
        }

        const skip = (page - 1) * limit;

        const productReturnDocs = await ProductReturn.aggregate(buildProductReturnAggregation(query, search))

        const combined = productReturnDocs.sort(
            (a, b) => new Date(b.productReturnDate).getTime() - new Date(a.productReturnDate).getTime()
        );

        const total = combined.length;
        const paginatedData = combined.slice(skip, skip + limit);

        return {
            data: paginatedData,
            total,
            page,
            limit,
            totalPage: Math.ceil(total / limit)
        };

    } catch (error: any) {
        console.error("Error in getAllProductReturn:", error);
        throw new Error(error.message || "Failed to fetch Product returns");
    }
};

export const getProductReturnById = async (id: string) => {
    try {
        // Try to find in GST Product return s
        const gstProductReturn = await ProductReturn.findById(id).populate('party').populate('vendor');
        if (gstProductReturn) return gstProductReturn;

        throw new Error("Product return not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};


export const deleteProductReturn = async (id: string) => {
    try {
        // Try to delete from GST Product return s
        const gstProductReturn = await ProductReturn.findByIdAndDelete(id);
        if (gstProductReturn) return gstProductReturn;

        throw new Error("Product return not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const getNextProductReturnNumber = async (): Promise<string> => {
    let prefix = "RR";
    try {
        // Find the last product return  number from both GST and NON-GST collections
        const [lastProductReturn] = await Promise.all([
            ProductReturn.findOne({
                productReturnNumber: { $regex: `^${prefix}${financialYear}-` }
            }).sort({ createdAt: -1 }).select('productReturnNumber')
        ]);

        // Get the highest sequence number from both collections
        let maxSequence = 0;

        [lastProductReturn].forEach(sr => {
            if (sr && sr.productReturnNumber) {
                const match = sr.productReturnNumber.match(/-(\d+)$/);
                if (match) {
                    const sequence = parseInt(match[1] as string);
                    if (sequence > maxSequence) {
                        maxSequence = sequence;
                    }
                }
            }
        });

        // The next number is current max + 1
        const nextSequence = maxSequence + 1;
        return `${prefix}${financialYear}-${String(nextSequence).padStart(0, "0")}`;
    } catch (error: any) {
        console.error("Error getting next product return number:", error);
        // If no product return s exist yet, start from 1
        return `${prefix}${financialYear}-1`;
    }
};

export const addStatusNote = async (
    productReturnId: string,
    note: string,
): Promise<IProductReturn | null> => {
    try {
        if (!Types.ObjectId.isValid(productReturnId)) {
            throw new Error('Invalid enquiry ID');
        }

        const productReturn: any = await ProductReturn.findById(productReturnId);
        if (!productReturn) {
            throw new Error('ProductReturn not found');
        }

        const statusNote = {
            previous_status: productReturn?.status_history.length > 0
                ? productReturn?.status_history[productReturn.status_history.length - 1]?.to_status
                : undefined,
            current_status: productReturn.status,
            note,
            created_at: new Date()
        };

        productReturn.status_notes.push(statusNote);
        await productReturn.save();

        return await getProductReturnById(productReturnId);
    } catch (error) {
        throw new Error(`Failed to add status note: ${error}`);
    }
};

// Get enquiry status history
export const getProductNoteStatusHistory = async (productReturnId: string): Promise<any> => {
    try {
        if (!Types.ObjectId.isValid(productReturnId)) {
            throw new Error('Invalid product return ID');
        }

        const productReturn = await ProductReturn.findById(productReturnId)
            .populate({
                path: 'status_history.changed_by',
                select: 'first_name last_name'
            })
            .select('status_history enquiry_no subject');

        if (!productReturn) {
            throw new Error('Enquiry not found');
        }

        return {
            productReturnNumber: productReturn.productReturnNumber,
            status_history: productReturn.status_history
        };
    } catch (error) {
        throw new Error(`Failed to get status history: ${error}`);
    }
};

