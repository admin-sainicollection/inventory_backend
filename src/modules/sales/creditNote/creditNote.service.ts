// salescredit note.service.ts
import { FilterOptions, GstType, ICreditNote } from "../types";
import { useFinancialYear } from "../../../utils/useFinancialYear";
import CreditNoteGst from "./creditNote.gst.model";
import CreditNoteNonGst from "./creditNote.non_gst.model";
const financialYear = useFinancialYear();

// ======================================================================HELPER FUNCTION
const buildCreditNoteAggregation = (
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

    // Lookup for invoice details based on invoiceId
    // For GST credit notes, look up GST invoices
    if (gstType === 'GST') {
        pipeline.push({
            $lookup: {
                from: "invoicegsts",  // Changed from "creditNoteGsts" to "invoicegsts"
                localField: "invoiceId",
                foreignField: "_id",
                as: "invoice"
            }
        });

        pipeline.push({
            $unwind: {
                path: "$invoice",
                preserveNullAndEmptyArrays: true
            }
        });
    }

    // For NON-GST credit notes, look up NON-GST invoices
    if (gstType === 'NON-GST') {
        pipeline.push({
            $lookup: {
                from: "invoicenongsts",  // Changed from "creditNoteNonGsts" to "invoicenongsts"
                localField: "invoiceId",
                foreignField: "_id",
                as: "invoice"
            }
        });

        pipeline.push({
            $unwind: {
                path: "$invoice",
                preserveNullAndEmptyArrays: true
            }
        });
    }

    if (search?.trim()) {
        const regex = new RegExp(search, "i");

        pipeline.push({
            $match: {
                $or: [
                    { creditNoteNumber: regex },
                    { "party.partyName": regex },
                    { "party.nickName": regex },
                    { "party.gstNumber": regex },
                    { "invoice.invoiceNumber": regex },  // Add invoice number to search
                ]
            }
        });
    }

    pipeline.push({ $sort: { creditNoteDate: -1 } });

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

// ============================================================================SERVICES

export const createCreditNote = async (data: Partial<ICreditNote>) => {
    try {
        if (!data.gstType) {
            throw new Error("GST type is required")
        }

        if (data.gstType === 'GST') {
            if (!data.creditNoteNumber) {
                data.creditNoteNumber = await getNextCreditNoteNumber(data.creditNoteType || 'CREDIT_NOTE', data.gstType || 'GST');
            }

            const [existingGst] = await Promise.all([
                CreditNoteGst.findOne({ creditNoteNumber: data.creditNoteNumber })
            ]);

            if (existingGst) {
                throw new Error("Credit note number already exists")
            }
            return await CreditNoteGst.create(data);
        }

        if (data.gstType === 'NON-GST') {
            if (!data.creditNoteNumber) {
                data.creditNoteNumber = await getNextCreditNoteNumber(data.creditNoteType || 'CREDIT_NOTE', data.gstType || 'GST');
            }
            const [existingNonGst] = await Promise.all([
                CreditNoteNonGst.findOne({ creditNoteNumber: data.creditNoteNumber })
            ]);

            if (existingNonGst) {
                throw new Error("Credit note number already exists")
            }
            return await CreditNoteNonGst.create(data);
        }
        throw new Error("Invalid GST Type")
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export const getAllCreditNote = async (filters: FilterOptions = {}) => {
    try {
        const {
            gstType = "all",
            limit = 50,
            page = 1,
            search,
            status,
            startDate,
            endDate,
            dateRange
        } = filters;

        const query: any = {};

        if (status && status !== "all") {
            query.status = status;
        }

        if (dateRange && dateRange !== "all" && dateRange !== "custom") {
            const dateQuery = getDateRangeQuery(dateRange);
            if (dateQuery) query.creditNoteDate = dateQuery;
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
            query.creditNoteDate = dq;
        }

        const skip = (page - 1) * limit;

        // =========================
        // GST ONLY
        // =========================
        if (gstType === "GST") {
            const result = await CreditNoteGst.aggregate([
                ...buildCreditNoteAggregation(query, search, "GST"),
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
            const result = await CreditNoteNonGst.aggregate([
                ...buildCreditNoteAggregation(query, search, "NON-GST"),
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
            CreditNoteGst.aggregate(buildCreditNoteAggregation(query, search)),
            CreditNoteNonGst.aggregate(buildCreditNoteAggregation(query, search))
        ]);

        const combined = [...gstDocs, ...nonGstDocs].sort(
            (a, b) => new Date(b.creditNoteDate).getTime() - new Date(a.creditNoteDate).getTime()
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
        console.error("Error in getAllCreditNote:", error);
        throw new Error(error.message || "Failed to fetch credit notes");
    }
};

// Get next available credit note number (for display only)
export const getNextCreditNoteNumber = async (creditNoteType: string = "CREDIT_NOTE", gstType: GstType = 'GST'): Promise<string> => {
    let prefix = "CN";
    try {

        if (creditNoteType && gstType === "NON-GST") {
            // Find the last credit note number from both GST and NON-GST collections
            const [lastNonGstCreditNote] = await Promise.all([
                CreditNoteNonGst.findOne({
                    creditNoteNumber: { $regex: `^${prefix}${financialYear}-` }
                }).sort({ createdAt: -1 }).select('creditNoteNumber')
            ]);

            // Get the highest sequence number from both collections
            let maxSequence = 0;

            [lastNonGstCreditNote].forEach(cn => {
                if (cn && cn.creditNoteNumber) {
                    const match = cn.creditNoteNumber.match(/-(\d+)$/);
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
        } if (creditNoteType && gstType === "GST") {
            // Find the last credit note number from both GST and NON-GST collections
            const [lastGstCreditNote] = await Promise.all([
                CreditNoteGst.findOne({
                    creditNoteNumber: { $regex: `^${prefix}${financialYear}-` }
                }).sort({ createdAt: -1 }).select('creditNoteNumber'),
            ]);

            // Get the highest sequence number from both collections
            let maxSequence = 0;

            [lastGstCreditNote].forEach(cn => {
                if (cn && cn.creditNoteNumber) {
                    const match = cn.creditNoteNumber.match(/-(\d+)$/);
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
        throw new Error("Invalid GST Type or Credit note Type")
    } catch (error: any) {
        console.error("Error getting next Credit note number:", error);
        // If no credit notes exist yet, start from 1
        return `${prefix}${financialYear}-1`;
    }
};

// Get specific credit note by ID
export const getCreditNoteById = async (id: string) => {
    try {
        // Try to find in GST credit notes
        const gstCreditNote = await CreditNoteGst.findById(id).populate('party');
        if (gstCreditNote) return gstCreditNote;

        // Try to find in NON-GST credit notes
        const nonGstCreditNote = await CreditNoteNonGst.findById(id).populate('party');
        if (nonGstCreditNote) return nonGstCreditNote;

        throw new Error("Credit Note not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// Update credit note
export const updateCreditNote = async (id: string, data: Partial<ICreditNote>) => {
    try {
        // Try to update in GST credit notes
        const gstCreditNote = await CreditNoteGst.findById(id);
        if (gstCreditNote) {
            return await CreditNoteGst.findByIdAndUpdate(id, data, { new: true });
        }

        // Try to update in NON-GST credit notes
        const nonGstCreditNote = await CreditNoteNonGst.findById(id);
        if (nonGstCreditNote) {
            return await CreditNoteNonGst.findByIdAndUpdate(id, data, { new: true });
        }

        throw new Error("Credit Note not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// Delete credit note
export const deleteCreditNote = async (id: string) => {
    try {
        // Try to delete from GST credit notes
        const gstCreditNote = await CreditNoteGst.findByIdAndDelete(id);
        if (gstCreditNote) return gstCreditNote;

        // Try to delete from NON-GST credit notes
        const nonGstCreditNote = await CreditNoteNonGst.findByIdAndDelete(id);
        if (nonGstCreditNote) return nonGstCreditNote;

        throw new Error("Credit Note not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};