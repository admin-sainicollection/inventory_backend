import { FilterOptions, GstType, IPurchaseReturn } from "../types";
import { useFinancialYear } from "../../../utils/useFinancialYear";
import { getInvoiceStatus } from "../../../utils/invoiceStatus";
import { getNextProductReturnNumber } from "../../productReturn/productReturn.service";
import { CreateProductReurn, IStatusActivity, IStatusNote } from "../../productReturn/types";
import { ProductReturn } from "../../productReturn/productReturn.model";
import mongoose from "mongoose";
import PurchaseReturnGst from "./purchaseReturn.gst.model";
import PurchaseReturnNonGst from "./purchaseReturn.non_gst.model";
const financialYear = useFinancialYear();

// ======================================================================HELPER FUNCTION
const buildPurchaseReturnAggregation = (
    matchQuery: any,
    search?: string,
    gstType?: GstType
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

    // Lookup for invoice details based on purchaseId
    // For GST Purchase return s, look up GST invoices
    if (gstType === 'GST') {
        pipeline.push({
            $lookup: {
                from: "purchasegsts",  // Changed from "PurchaseReturnGsts" to "purchasegsts"
                localField: "purchaseId",
                foreignField: "_id",
                as: "purchase"
            }
        });

        pipeline.push({
            $unwind: {
                path: "$purchase",
                preserveNullAndEmptyArrays: true
            }
        });
    }

    // For NON-GST Purchase return s, look up NON-GST invoices
    if (gstType === 'NON-GST') {
        pipeline.push({
            $lookup: {
                from: "purchasenongsts",  // Changed from "PurchaseReturnNonGsts" to "invoicenongsts"
                localField: "purchaseId",
                foreignField: "_id",
                as: "purchase"
            }
        });

        pipeline.push({
            $unwind: {
                path: "$purchase",
                preserveNullAndEmptyArrays: true
            }
        });
    }

    if (search?.trim()) {
        const regex = new RegExp(search, "i");

        pipeline.push({
            $match: {
                $or: [
                    { purchaseReturnNumber: regex },
                    { "party.partyName": regex },
                    { "party.nickName": regex },
                    { "party.gstNumber": regex },
                    { "vendor.vendorName": regex },
                    { "vendor.nickName": regex },
                    { "vendor.gstNumber": regex },
                    { "purchase.purchaseNumber": regex },  // Add invoice number to search
                ]
            }
        });
    }

    pipeline.push({ $sort: { purchaseReturnDate: -1 } });

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

export const createProductReturnFromPurchaseReturn = async (purchaseReturnData: any) => {
    try {
        const productReturnNumber = await getNextProductReturnNumber();
        const items = purchaseReturnData.items?.map((item: any, index: number) => ({
            srNo: index + 1,
            productId: item.productId || item.product?._id,
            itemName: item.itemName || item.product?.name,
            aliasName: item.aliasName || '',
            hsnNo: item.hsnNo || item.product?.partNo || '',
            quantity: item.quantity || 0,
            price: item.price || 0,
            amount: (item.quantity || 0) * (item.price || 0),
        })) || [];

        const initialStatusActivity: IStatusActivity = {
            from_status: undefined,
            to_status: 'RETURN_CREATED',
            note: `Auto-created from purchase return: ${purchaseReturnData.purchaseReturnNumber}`,
            changed_at: new Date(),
            is_initial: true
        }

        const initialStatusNote: IStatusNote = {
            previous_status: undefined,
            current_status: 'RETURN_CREATED',
            note: `Product return auto-generated from purchase return ${purchaseReturnData.purchaseReturnNumber}`,
            created_at: new Date()
        };

        const productReturnData: CreateProductReurn = {
            productReturnNumber,
            productReturnDate: purchaseReturnData.purchaseReturnDate || new Date(),
            in_date: purchaseReturnData.in_date || null,
            out_date: purchaseReturnData.out_date || null,
            items: items,
            party: purchaseReturnData.party || null,
            vendor: purchaseReturnData.vendor || null,
            description: `Auto-created from purchase return ${purchaseReturnData.purchaseReturnNumber}. Original purchase return description: ${purchaseReturnData.description || ''}`,
            status: 'RETURN_CREATED',
            status_note: `Auto-created from purchase return ${purchaseReturnData.purchaseReturnNumber}`,
        };

        // Create the product return
        const productReturn = await ProductReturn.create(productReturnData);

        return productReturn;
    } catch (error: any) {
        console.error('Error creating product return from purchase return:', error);
        throw new Error(`Failed to create product return: ${error.message}`);
    }
}

export const createPurchaseReturn = async (data: Partial<IPurchaseReturn>) => {
    try {
        const status = getInvoiceStatus(data.receivedAmount, data.totalAmount);

        if (!data.gstType) {
            throw new Error("GST type is required")
        }

        let purchaseReturn: any;

        if (data.gstType === 'GST') {
            if (!data.purchaseReturnNumber) {
                data.purchaseReturnNumber = await getNextPurchaseReturnNumber(data.purchaseReturnType || 'PURCHASE_RETURN', data.gstType || 'GST');
            }

            const [existingGst] = await Promise.all([
                PurchaseReturnGst.findOne({ purchaseReturnNumber: data.purchaseReturnNumber })
            ]);

            if (existingGst) {
                throw new Error("Purchase return number already exists")
            }

            purchaseReturn = await PurchaseReturnGst.create({ ...data, status });
        } else if (data.gstType === 'NON-GST') {
            if (!data.purchaseReturnNumber) {
                data.purchaseReturnNumber = await getNextPurchaseReturnNumber(data.purchaseReturnType || 'PURCHASE_RETURN', data.gstType || 'GST');
            }
            const [existingNonGst] = await Promise.all([
                PurchaseReturnNonGst.findOne({ purchaseReturnNumber: data.purchaseReturnNumber })
            ]);

            if (existingNonGst) {
                throw new Error("Purchase return number already exists")
            }

            purchaseReturn = await PurchaseReturnNonGst.create({ ...data, status });
        } else {
            throw new Error("Invalid GST Type")
        }

        createProductReturnFromPurchaseReturn(purchaseReturn.toObject ? purchaseReturn.toObject() : purchaseReturn)
            .then(productReturn => {
                console.log(`Product return ${productReturn.productReturnNumber} created for purchase return ${purchaseReturn.purchaseReturnNumber}`);
            })
            .catch(error => {
                console.error('Failed to create product return:', error);
            });

        return purchaseReturn;

    } catch (error: any) {
        throw new Error(error.message)
    }
};

export const getAllPurchaseReturn = async (filters: FilterOptions = {}) => {
    try {
        const {
            gstType = "all",
            limit = 50,
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
            if (dateQuery) query.purchaseReturnDate = dateQuery;
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
            query.purchaseReturnDate = dq;
        }

        const skip = (page - 1) * limit;

        // =========================
        // GST ONLY
        // =========================
        if (gstType === "GST") {
            const result = await PurchaseReturnGst.aggregate([
                ...buildPurchaseReturnAggregation(query, search, "GST"),
                {
                    $facet: {
                        data: [{ $skip: skip }, { $limit: limit }],
                        totalCount: [{ $count: "count" }]
                    }
                }
            ]);

            return formatResponse(result, page, limit);
        }

        // =========================
        // NON-GST ONLY
        // =========================
        if (gstType === "NON-GST") {
            const result = await PurchaseReturnNonGst.aggregate([
                ...buildPurchaseReturnAggregation(query, search, "NON-GST"),
                {
                    $facet: {
                        data: [{ $skip: skip }, { $limit: limit }],
                        totalCount: [{ $count: "count" }]
                    }
                }
            ]);

            return formatResponse(result, page, limit);
        }

        // =========================
        // BOTH (FIXED PAGINATION)
        // =========================
        const [gstDocs, nonGstDocs] = await Promise.all([
            PurchaseReturnGst.aggregate(buildPurchaseReturnAggregation(query, search)),
            PurchaseReturnNonGst.aggregate(buildPurchaseReturnAggregation(query, search))
        ]);

        const combined = [...gstDocs, ...nonGstDocs].sort(
            (a, b) => new Date(b.purchaseReturnDate).getTime() - new Date(a.purchaseReturnDate).getTime()
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
        console.error("Error in getAllPurchaseReturn:", error);
        throw new Error(error.message || "Failed to fetch purchase returns");
    }
};

// Get next available Purchase return  number (for display only)
export const getNextPurchaseReturnNumber = async (purchaseReturnType: string = "PURCHASE_RETURN", gstType: GstType = 'GST'): Promise<string> => {
    let prefix = "PR";
    try {

        if (purchaseReturnType && gstType === "NON-GST") {
            // Find the last Purchase return  number from both GST and NON-GST collections
            const [lastNonGstPurchaseReturn] = await Promise.all([
                PurchaseReturnNonGst.findOne({
                    purchaseReturnNumber: { $regex: `^${prefix}${financialYear}-` }
                }).sort({ createdAt: -1 }).select('purchaseReturnNumber')
            ]);

            // Get the highest sequence number from both collections
            let maxSequence = 0;

            [lastNonGstPurchaseReturn].forEach(sr => {
                if (sr && sr.purchaseReturnNumber) {
                    const match = sr.purchaseReturnNumber.match(/-(\d+)$/);
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
        } if (purchaseReturnType && gstType === "GST") {
            // Find the last Purchase return  number from both GST and NON-GST collections
            const [lastGstPurchaseReturn] = await Promise.all([
                PurchaseReturnGst.findOne({
                    purchaseReturnNumber: { $regex: `^${prefix}${financialYear}-` }
                }).sort({ createdAt: -1 }).select('purchaseReturnNumber'),
            ]);

            // Get the highest sequence number from both collections
            let maxSequence = 0;

            [lastGstPurchaseReturn].forEach(sr => {
                if (sr && sr.purchaseReturnNumber) {
                    const match = sr.purchaseReturnNumber.match(/-(\d+)$/);
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
        }
        throw new Error("Invalid GST Type or purchase return Type")
    } catch (error: any) {
        console.error("Error getting next purchase return number:", error);
        // If no Purchase return s exist yet, start from 1
        return `${prefix}${financialYear}-1`;
    }
};

// Get specific Purchase return  by ID
export const getPurchaseReturnById = async (id: string) => {
    try {
        // Try to find in GST Purchase return s
        const gstPurchaseReturn = await PurchaseReturnGst.findById(id).populate('party').populate('vendor');
        if (gstPurchaseReturn) return gstPurchaseReturn;

        // Try to find in NON-GST Purchase return s
        const nonGstPurchaseReturn = await PurchaseReturnNonGst.findById(id).populate('party').populate('vendor');
        if (nonGstPurchaseReturn) return nonGstPurchaseReturn;

        throw new Error("Purchase return not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// Update Purchase return 
export const updatePurchaseReturn = async (id: string, data: Partial<IPurchaseReturn>) => {
    try {
        const status = getInvoiceStatus(data.receivedAmount, data.totalAmount);
        // Try to update in GST Purchase return s
        const gstPurchaseReturn = await PurchaseReturnGst.findById(id);
        if (gstPurchaseReturn) {
            return await PurchaseReturnGst.findByIdAndUpdate(id, { ...data, status }, { new: true });
        }

        // Try to update in NON-GST Purchase return s
        const nonGstPurchaseReturn = await PurchaseReturnNonGst.findById(id);
        if (nonGstPurchaseReturn) {
            return await PurchaseReturnNonGst.findByIdAndUpdate(id, { ...data, status }, { new: true });
        }

        throw new Error("Purchase return not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// Delete Purchase return 
export const deletePurchaseReturn = async (id: string) => {
    try {
        // Try to delete from GST Purchase return s
        const gstPurchaseReturn = await PurchaseReturnGst.findByIdAndDelete(id);
        if (gstPurchaseReturn) return gstPurchaseReturn;

        // Try to delete from NON-GST Purchase return s
        const nonGstPurchaseReturn = await PurchaseReturnNonGst.findByIdAndDelete(id);
        if (nonGstPurchaseReturn) return nonGstPurchaseReturn;

        throw new Error("Purchase return not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};