import { FilterOptions, GstType, IPaymentIn } from "../types";
import { useFinancialYear } from "../../../utils/useFinancialYear";
import PaymentInNonGst from "./paymentIn.non_gst.model";
import PaymentInGst from "./paymentIn.gst.model";
const financialYear = useFinancialYear();

// ======================================================================HELPER FUNCTION
const buildPaymentInAggregation = (
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

    // For GST payment ins, look up GST invoices
    if (gstType === 'GST') {
        pipeline.push({
            $lookup: {
                from: "invoicegsts", 
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

    // For NON-GST payment ins, look up NON-GST invoices
    if (gstType === 'NON-GST') {
        pipeline.push({
            $lookup: {
                from: "invoicenongsts",  // Changed from "PaymentInNonGsts" to "invoicenongsts"
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
                    { paymentInNumber: regex },
                    { "party.partyName": regex },
                    { "party.nickName": regex },
                    { "party.gstNumber": regex },
                    { "invoice.invoiceNumber": regex },  // Add invoice number to search
                ]
            }
        });
    }

    pipeline.push({ $sort: { paymentInDate: -1 } });

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

export const createPaymentIn = async (data: Partial<IPaymentIn>) => {
    try {
        if (!data.gstType) {
            throw new Error("GST type is required")
        }

        if (data.gstType === 'GST') {
            if (!data.paymentInNumber) {
                data.paymentInNumber = await getNextPaymentInNumber(data.paymentInType || 'PAYMENT_IN', data.gstType || 'GST');
            }

            const [existingGst] = await Promise.all([
                PaymentInGst.findOne({ paymentInNumber: data.paymentInNumber })
            ]);

            if (existingGst) {
                throw new Error("Payment In number already exists")
            }
            return await PaymentInGst.create(data);
        }

        if (data.gstType === 'NON-GST') {
            if (!data.paymentInNumber) {
                data.paymentInNumber = await getNextPaymentInNumber(data.paymentInType || 'PAYMENT_IN', data.gstType || 'GST');
            }
            const [existingNonGst] = await Promise.all([
                PaymentInNonGst.findOne({ paymentInNumber: data.paymentInNumber })
            ]);

            if (existingNonGst) {
                throw new Error("Payment In number already exists")
            }
            return await PaymentInNonGst.create(data);
        }
        throw new Error("Invalid GST Type")
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export const getAllPaymentIn = async (filters: FilterOptions = {}) => {
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
            if (dateQuery) query.paymentInDate = dateQuery;
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
            query.paymentInDate = dq;
        }

        const skip = (page - 1) * limit;

        // =========================
        // GST ONLY
        // =========================
        if (gstType === "GST") {
            const result = await PaymentInGst.aggregate([
                ...buildPaymentInAggregation(query, search, "GST"),
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
            const result = await PaymentInNonGst.aggregate([
                ...buildPaymentInAggregation(query, search, "NON-GST"),
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
            PaymentInGst.aggregate(buildPaymentInAggregation(query, search)),
            PaymentInNonGst.aggregate(buildPaymentInAggregation(query, search))
        ]);

        const combined = [...gstDocs, ...nonGstDocs].sort(
            (a, b) => new Date(b.paymentInDate).getTime() - new Date(a.paymentInDate).getTime()
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
        console.error("Error in getAllPaymentIn:", error);
        throw new Error(error.message || "Failed to fetch payment in");
    }
};

// Get next available payment in number (for display only)
export const getNextPaymentInNumber = async (paymentInType: string = "PAYMENT_IN", gstType: GstType = 'GST'): Promise<string> => {
    let prefix = "PI";
    try {

        if (paymentInType && gstType === "NON-GST") {
            // Find the last payment in number from both GST and NON-GST collections
            const [lastNonGstPaymentIn] = await Promise.all([
                PaymentInNonGst.findOne({
                    paymentInNumber: { $regex: `^${prefix}${financialYear}-` }
                }).sort({ createdAt: -1 }).select('paymentInNumber')
            ]);

            // Get the highest sequence number from both collections
            let maxSequence = 0;

            [lastNonGstPaymentIn].forEach(pi => {
                if (pi && pi.paymentInNumber) {
                    const match = pi.paymentInNumber.match(/-(\d+)$/);
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
        } if (paymentInType && gstType === "GST") {
            // Find the last payment in number from both GST and NON-GST collections
            const [lastGstPaymentIn] = await Promise.all([
                PaymentInGst.findOne({
                    paymentInNumber: { $regex: `^${prefix}${financialYear}-` }
                }).sort({ createdAt: -1 }).select('paymentInNumber'),
            ]);

            // Get the highest sequence number from both collections
            let maxSequence = 0;

            [lastGstPaymentIn].forEach(pi => {
                if (pi && pi.paymentInNumber) {
                    const match = pi.paymentInNumber.match(/-(\d+)$/);
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
        throw new Error("Invalid GST Type or payment in Type")
    } catch (error: any) {
        console.error("Error getting next Payment in number:", error);
        // If no payment ins exist yet, start from 1
        return `${prefix}${financialYear}-1`;
    }
};

// Get specific payment in by ID
export const getPaymentInById = async (id: string) => {
    try {
        // Try to find in GST payment ins
        const gstPaymentIn = await PaymentInGst.findById(id).populate('party');
        if (gstPaymentIn) return gstPaymentIn;

        // Try to find in NON-GST payment ins
        const nonGstPaymentIn = await PaymentInNonGst.findById(id).populate('party');
        if (nonGstPaymentIn) return nonGstPaymentIn;

        throw new Error("Payment In not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// Update payment in
export const updatePaymentIn = async (id: string, data: Partial<IPaymentIn>) => {
    try {
        // Try to update in GST payment ins
        const gstPaymentIn = await PaymentInGst.findById(id);
        if (gstPaymentIn) {
            return await PaymentInGst.findByIdAndUpdate(id, data, { new: true });
        }

        // Try to update in NON-GST payment ins
        const nonGstPaymentIn = await PaymentInNonGst.findById(id);
        if (nonGstPaymentIn) {
            return await PaymentInNonGst.findByIdAndUpdate(id, data, { new: true });
        }

        throw new Error("Payment In not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// Delete payment in
export const deletePaymentIn = async (id: string) => {
    try {
        // Try to delete from GST payment ins
        const gstPaymentIn = await PaymentInGst.findByIdAndDelete(id);
        if (gstPaymentIn) return gstPaymentIn;

        // Try to delete from NON-GST payment ins
        const nonGstPaymentIn = await PaymentInNonGst.findByIdAndDelete(id);
        if (nonGstPaymentIn) return nonGstPaymentIn;

        throw new Error("Payment In not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};