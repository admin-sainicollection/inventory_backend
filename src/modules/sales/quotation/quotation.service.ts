import { FilterOptions, GstType, IQuotation } from "../types";
import QuotationGst from "./quotation.gst.model";
import QuotationNonGst from "./quotation.non_gst.model";
import { useFinancialYear } from "../../../utils/useFinancialYear";
import { getQuotationStatus } from "../../../utils/quotationStatus";
const financialYear = useFinancialYear();

// ======================================================================HELPER FUNCTION
const buildQuotationAggregation = (
    matchQuery: any,
    search?: string
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

    if (search?.trim()) {
        const regex = new RegExp(search, "i");

        pipeline.push({
            $match: {
                $or: [
                    { quotationNumber: regex },
                    { "party.partyName": regex },
                    { "party.nickName": regex },
                    { "party.gstNumber": regex }
                ]
            }
        });
    }

    pipeline.push({ $sort: { quotationDate: -1 } });

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

export const createQuotation = async (data: Partial<IQuotation>) => {
    try {
        const status = getQuotationStatus(data.dueDate);
        if (!data.gstType) {
            throw new Error("GST type is required")
        }

        if (data.gstType === 'GST') {
            if (!data.quotationNumber) {
                data.quotationNumber = await getNextQuotationNumber(data.quotationNumber || 'QUOTATION', data.gstType || 'GST');
            }

            const [existingGst] = await Promise.all([
                QuotationGst.findOne({ quotationNumber: data.quotationNumber })
            ]);

            if (existingGst) {
                throw new Error("Quotation number already exists")
            }
            return await QuotationGst.create({ ...data, status });
        }

        if (data.gstType === 'NON-GST') {
            if (!data.quotationNumber) {
                data.quotationNumber = await getNextQuotationNumber(data.quotationType || 'QUOTATION');
            }
            const [existingNonGst] = await Promise.all([
                QuotationNonGst.findOne({ quotationNumber: data.quotationNumber })
            ]);

            if (existingNonGst) {
                throw new Error("Quotation number already exists")
            }
            return await QuotationNonGst.create({ ...data, status });
        }
        throw new Error("Invalid GST Type")
    } catch (error: any) {
        throw new Error(error.message)
    }
}


export const getNextQuotationNumber = async (quotationType: string = "QUOTATION", gstType: GstType = 'GST'): Promise<string> => {
    let prefix = "QUO";
    try {

        if (quotationType && gstType === "NON-GST") {
            // Find the last quotation number from both GST and NON-GST collections
            const [lastNonGstQuotation] = await Promise.all([
                QuotationNonGst.findOne({
                    quotationNumber: { $regex: `^${prefix}${financialYear}-` }
                }).sort({ createdAt: -1 }).select('quotationNumber')
            ]);

            // Get the highest sequence number from both collections
            let maxSequence = 0;

            [lastNonGstQuotation].forEach(quotation => {
                if (quotation && quotation.quotationNumber) {
                    const match = quotation.quotationNumber.match(/-(\d+)$/);
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
        } if (quotationType && gstType === "GST") {
            // Find the last quotation number from both GST and NON-GST collections
            const [lastGstQuotation] = await Promise.all([
                QuotationGst.findOne({
                    quotationNumber: { $regex: `^${prefix}${financialYear}-` }
                }).sort({ createdAt: -1 }).select('quotationNumber'),
            ]);

            // Get the highest sequence number from both collections
            let maxSequence = 0;

            [lastGstQuotation].forEach(quotation => {
                if (quotation && quotation.quotationNumber) {
                    const match = quotation.quotationNumber.match(/-(\d+)$/);
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
        throw new Error("Invalid GST Type or Quotation Type")
    } catch (error: any) {
        console.error("Error getting next quotation number:", error);
        // If no quotations exist yet, start from 1
        return `${prefix}${financialYear}-1`;
    }
};

export const getAllQuotation = async (filters: FilterOptions = {}) => {
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
            if (dateQuery) query.quotationDate = dateQuery;
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
            query.quotationDate = dq;
        }

        const skip = (page - 1) * limit;

        // =========================
        // GST ONLY
        // =========================
        if (gstType === "GST") {
            const result = await QuotationGst.aggregate([
                ...buildQuotationAggregation(query, search),
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
            const result = await QuotationNonGst.aggregate([
                ...buildQuotationAggregation(query, search),
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
            QuotationGst.aggregate(buildQuotationAggregation(query, search)),
            QuotationNonGst.aggregate(buildQuotationAggregation(query, search))
        ]);

        const combined = [...gstDocs, ...nonGstDocs].sort(
            (a, b) => new Date(b.quotationDate).getTime() - new Date(a.quotationDate).getTime()
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
        console.error("Error in getAllQuotation:", error);
        throw new Error(error.message || "Failed to fetch Quotation");
    }
};

export const getQuotationById = async (id: string) => {
    try {
        // Try to find in GST invoices
        const gstQuotation = await QuotationGst.findById(id).populate('party');
        if (gstQuotation) return gstQuotation;

        // Try to find in NON-GST invoices
        const nonGstQuotation = await QuotationNonGst.findById(id).populate('party');
        if (nonGstQuotation) return nonGstQuotation;

        throw new Error("Quotation not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const updateQuotation = async (id: string, data: Partial<IQuotation>) => {
    try {
        const status = getQuotationStatus(data.dueDate);
        // Try to update in GST invoices
        const gstQuotation = await QuotationGst.findById(id);
        if (gstQuotation) {
            return await QuotationGst.findByIdAndUpdate(id, { ...data, status }, { new: true });
        }

        // Try to update in NON-GST invoices
        const nonGstQuotation = await QuotationNonGst.findById(id);
        if (nonGstQuotation) {
            return await QuotationNonGst.findByIdAndUpdate(id, { ...data, status }, { new: true });
        }

        throw new Error("Quotation not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const setIsClosedStatus = async (
    id: string | undefined,
    isClosed: boolean
) => {
    try {

        // First try GST
        let quotation = await QuotationGst.findById(id);
        let Model = QuotationGst;

        // If not found, try NON-GST
        if (!quotation) {
            quotation = await QuotationNonGst.findById(id);
            Model = QuotationNonGst;
        }

        if (!quotation) {
            throw new Error("Quotation not found");
        }

        // Calculate new status
        const status = getQuotationStatus(
            quotation.dueDate,
            !!quotation.isConverted,
            isClosed
        );

        // Update quotation
        return await Model.findByIdAndUpdate(
            id,
            {
                isClosed,
                status
            },
            { new: true }
        );

    } catch (error: any) {
        throw new Error(error.message);
    }
};


export const deleteQuotation = async (id: string) => {
    try {
        // Try to delete from GST invoices
        const gstQuotation = await QuotationGst.findByIdAndDelete(id);
        if (gstQuotation) return gstQuotation;

        // Try to delete from NON-GST invoices
        const nonGstQuotation = await QuotationNonGst.findByIdAndDelete(id);
        if (nonGstQuotation) return nonGstQuotation;

        throw new Error("Quotation not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};