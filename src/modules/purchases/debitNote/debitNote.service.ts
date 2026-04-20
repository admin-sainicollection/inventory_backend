import { FilterOptions, GstType, IDebitNote } from "../types";
import { useFinancialYear } from "../../../utils/useFinancialYear";
import { getInvoiceStatus } from "../../../utils/invoiceStatus";
import mongoose from "mongoose";
import DebitNoteGst from "./debitNote.gst.model";
import DebitNoteNonGst from "./debitNote.non_gst.model";
const financialYear = useFinancialYear();

// ======================================================================HELPER FUNCTION
const buildDebitNoteAggregation = (
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
    // For GST Debit Notes, look up GST invoices
    if (gstType === 'GST') {
        pipeline.push({
            $lookup: {
                from: "purchasegsts",  // Changed from "DebitNoteGsts" to "purchasegsts"
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

    // For NON-GST Debit Notes, look up NON-GST invoices
    if (gstType === 'NON-GST') {
        pipeline.push({
            $lookup: {
                from: "purchasenongsts",  // Changed from "DebitNoteNonGsts" to "invoicenongsts"
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
                    { debitNoteNumber: regex },
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

    pipeline.push({ $sort: { debitNoteDate: -1 } });

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


export const createDebitNote = async (data: Partial<IDebitNote>) => {
    try {
        const status = getInvoiceStatus(data.receivedAmount, data.totalAmount);

        if (!data.gstType) {
            throw new Error("GST type is required")
        }

        let debitNote: any;

        if (data.gstType === 'GST') {
            if (!data.debitNoteNumber) {
                data.debitNoteNumber = await getNextDebitNoteNumber(data.debitNoteType || 'DEBIT_NOTE', data.gstType || 'GST');
            }

            const [existingGst] = await Promise.all([
                DebitNoteGst.findOne({ debitNoteNumber: data.debitNoteNumber })
            ]);

            if (existingGst) {
                throw new Error("Debit note number already exists")
            }

            debitNote = await DebitNoteGst.create({ ...data, status });
        } else if (data.gstType === 'NON-GST') {
            if (!data.debitNoteNumber) {
                data.debitNoteNumber = await getNextDebitNoteNumber(data.debitNoteType || 'DEBIT_NOTE', data.gstType || 'GST');
            }
            const [existingNonGst] = await Promise.all([
                DebitNoteNonGst.findOne({ debitNoteNumber: data.debitNoteNumber })
            ]);

            if (existingNonGst) {
                throw new Error("Debit note number already exists")
            }

            debitNote = await DebitNoteNonGst.create({ ...data, status });
        } else {
            throw new Error("Invalid GST Type")
        }

    } catch (error: any) {
        throw new Error(error.message)
    }
};

export const getAllDebitNote = async (filters: FilterOptions = {}) => {
    try {
        const {
            gstType = "all",
            limit = 100000,
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
            if (dateQuery) query.debitNoteDate = dateQuery;
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
            query.debitNoteDate = dq;
        }

        const skip = (page - 1) * limit;

        // =========================
        // GST ONLY
        // =========================
        if (gstType === "GST") {
            const result = await DebitNoteGst.aggregate([
                ...buildDebitNoteAggregation(query, search, "GST"),
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
            const result = await DebitNoteNonGst.aggregate([
                ...buildDebitNoteAggregation(query, search, "NON-GST"),
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
            DebitNoteGst.aggregate(buildDebitNoteAggregation(query, search)),
            DebitNoteNonGst.aggregate(buildDebitNoteAggregation(query, search))
        ]);

        const combined = [...gstDocs, ...nonGstDocs].sort(
            (a, b) => new Date(b.debitNoteDate).getTime() - new Date(a.debitNoteDate).getTime()
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
        console.error("Error in getAllDebitNote:", error);
        throw new Error(error.message || "Failed to fetch debit notes");
    }
};

// Get next available Debit Note number (for display only)
export const getNextDebitNoteNumber = async (debitNoteType: string = "DEBIT_NOTE", gstType: GstType = 'GST'): Promise<string> => {
    let prefix = "DN";
    try {

        if (debitNoteType && gstType === "NON-GST") {
            // Find the last Debit Note number from both GST and NON-GST collections
            const [lastNonGstDebitNote] = await Promise.all([
                DebitNoteNonGst.findOne({
                    debitNoteNumber: { $regex: `^${prefix}${financialYear}-` }
                }).sort({ createdAt: -1 }).select('debitNoteNumber')
            ]);

            // Get the highest sequence number from both collections
            let maxSequence = 0;

            [lastNonGstDebitNote].forEach(sr => {
                if (sr && sr.debitNoteNumber) {
                    const match = sr.debitNoteNumber.match(/-(\d+)$/);
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
        } if (debitNoteType && gstType === "GST") {
            // Find the last Debit Note number from both GST and NON-GST collections
            const [lastGstDebitNote] = await Promise.all([
                DebitNoteGst.findOne({
                    debitNoteNumber: { $regex: `^${prefix}${financialYear}-` }
                }).sort({ createdAt: -1 }).select('debitNoteNumber'),
            ]);

            // Get the highest sequence number from both collections
            let maxSequence = 0;

            [lastGstDebitNote].forEach(sr => {
                if (sr && sr.debitNoteNumber) {
                    const match = sr.debitNoteNumber.match(/-(\d+)$/);
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
        throw new Error("Invalid GST Type or debit note Type")
    } catch (error: any) {
        console.error("Error getting next debit note number:", error);
        // If no Debit Notes exist yet, start from 1
        return `${prefix}${financialYear}-1`;
    }
};

// Get specific Debit Note by ID
export const getDebitNoteById = async (id: string) => {
    try {
        // Try to find in GST Debit Notes
        const gstDebitNote = await DebitNoteGst.findById(id).populate('party').populate('vendor');
        if (gstDebitNote) return gstDebitNote;

        // Try to find in NON-GST Debit Notes
        const nonGstDebitNote = await DebitNoteNonGst.findById(id).populate('party').populate('vendor');
        if (nonGstDebitNote) return nonGstDebitNote;

        throw new Error("Debit note not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// Update Debit Note
export const updateDebitNote = async (id: string, data: Partial<IDebitNote>) => {
    try {
        const status = getInvoiceStatus(data.receivedAmount, data.totalAmount);
        // Try to update in GST Debit Notes
        const gstDebitNote = await DebitNoteGst.findById(id);
        if (gstDebitNote) {
            return await DebitNoteGst.findByIdAndUpdate(id, { ...data, status }, { new: true });
        }

        // Try to update in NON-GST Debit Notes
        const nonGstDebitNote = await DebitNoteNonGst.findById(id);
        if (nonGstDebitNote) {
            return await DebitNoteNonGst.findByIdAndUpdate(id, { ...data, status }, { new: true });
        }

        throw new Error("Debit note not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// Delete Debit Note
export const deleteDebitNote = async (id: string) => {
    try {
        // Try to delete from GST Debit Notes
        const gstDebitNote = await DebitNoteGst.findByIdAndDelete(id);
        if (gstDebitNote) return gstDebitNote;

        // Try to delete from NON-GST Debit Notes
        const nonGstDebitNote = await DebitNoteNonGst.findByIdAndDelete(id);
        if (nonGstDebitNote) return nonGstDebitNote;

        throw new Error("Debit note not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};