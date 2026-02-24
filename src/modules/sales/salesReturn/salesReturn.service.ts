// salessales return .service.ts
import { FilterOptions, GstType, ISalesReturn } from "../types";
import { useFinancialYear } from "../../../utils/useFinancialYear";
import SalesReturnGst from "./salesReturn.gst.model";
import SalesReturnNonGst from "./salesReturn.non_gst.model";
import { getInvoiceStatus } from "../../../utils/invoiceStatus";
import { getNextProductReturnNumber } from "../../productReturn/productReturn.service";
import { CreateProductReurn, IStatusActivity, IStatusNote } from "../../productReturn/types";
import { ProductReturn } from "../../productReturn/productReturn.model";
const financialYear = useFinancialYear();

// ======================================================================HELPER FUNCTION
const buildSalesReturnAggregation = (
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
    // For GST sales return s, look up GST invoices
    if (gstType === 'GST') {
        pipeline.push({
            $lookup: {
                from: "invoicegsts",  // Changed from "SalesReturnGsts" to "invoicegsts"
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

    // For NON-GST sales return s, look up NON-GST invoices
    if (gstType === 'NON-GST') {
        pipeline.push({
            $lookup: {
                from: "invoicenongsts",  // Changed from "SalesReturnNonGsts" to "invoicenongsts"
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
                    { salesReturnNumber: regex },
                    { "party.partyName": regex },
                    { "party.nickName": regex },
                    { "party.gstNumber": regex },
                    { "invoice.invoiceNumber": regex },  // Add invoice number to search
                ]
            }
        });
    }

    pipeline.push({ $sort: { salesReturnDate: -1 } });

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

export const createProductReturnFromSalesReturn = async (salesReturnData: any) => {
    try {
        const productReturnNumber = await getNextProductReturnNumber();
        const items = salesReturnData.items?.map((item: any, index: number) => ({
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
            note: `Auto-created from sales return: ${salesReturnData.salesReturnNumber}`,
            changed_at: new Date(),
            is_initial: true
        }

        const initialStatusNote: IStatusNote = {
            previous_status: undefined,
            current_status: 'RETURN_CREATED',
            note: `Product return auto-generated from sales return ${salesReturnData.salesReturnNumber}`,
            created_at: new Date()
        };

        const productReturnData: CreateProductReurn = {
            productReturnNumber,
            productReturnDate: salesReturnData.salesReturnDate || new Date(),
            in_date: salesReturnData.in_date || null,
            out_date: salesReturnData.out_date || null,
            items: items,
            party: salesReturnData.party,
            vendor: salesReturnData.vendor || null,
            description: `Auto-created from sales return ${salesReturnData.salesReturnNumber}. Original sales return description: ${salesReturnData.description || ''}`,
            status: 'RETURN_CREATED',
            status_note: `Auto-created from sales return ${salesReturnData.salesReturnNumber}`,
        };

        // Create the product return
        const productReturn = await ProductReturn.create(productReturnData);

        return productReturn;
    } catch (error: any) {
        console.error('Error creating product return from sales return:', error);
        throw new Error(`Failed to create product return: ${error.message}`);
    }
}

// ============================================================================SERVICES

// export const createSalesReturn = async (data: Partial<ISalesReturn>) => {
//     try {
//         const status = getInvoiceStatus(data.receivedAmount, data.totalAmount);

//         if (!data.gstType) {
//             throw new Error("GST type is required")
//         }

//         if (data.gstType === 'GST') {
//             if (!data.salesReturnNumber) {
//                 data.salesReturnNumber = await getNextSalesReturnNumber(data.salesReturnType || 'SALES_RETURN', data.gstType || 'GST');
//             }

//             const [existingGst] = await Promise.all([
//                 SalesReturnGst.findOne({ salesReturnNumber: data.salesReturnNumber })
//             ]);

//             if (existingGst) {
//                 throw new Error("Sales return number already exists")
//             }
//             return await SalesReturnGst.create({ ...data, status });
//         }

//         if (data.gstType === 'NON-GST') {
//             if (!data.salesReturnNumber) {
//                 data.salesReturnNumber = await getNextSalesReturnNumber(data.salesReturnType || 'SALES_RETURN', data.gstType || 'GST');
//             }
//             const [existingNonGst] = await Promise.all([
//                 SalesReturnNonGst.findOne({ salesReturnNumber: data.salesReturnNumber })
//             ]);

//             if (existingNonGst) {
//                 throw new Error("Sales return number already exists")
//             }
//             return await SalesReturnNonGst.create({ ...data, status });
//         }
//         throw new Error("Invalid GST Type")
//     } catch (error: any) {
//         throw new Error(error.message)
//     }
// }

export const createSalesReturn = async (data: Partial<ISalesReturn>) => {
    try {
        const status = getInvoiceStatus(data.receivedAmount, data.totalAmount);

        if (!data.gstType) {
            throw new Error("GST type is required")
        }

        let salesReturn: any;

        if (data.gstType === 'GST') {
            if (!data.salesReturnNumber) {
                data.salesReturnNumber = await getNextSalesReturnNumber(data.salesReturnType || 'SALES_RETURN', data.gstType || 'GST');
            }

            const [existingGst] = await Promise.all([
                SalesReturnGst.findOne({ salesReturnNumber: data.salesReturnNumber })
            ]);

            if (existingGst) {
                throw new Error("Sales return number already exists")
            }

            salesReturn = await SalesReturnGst.create({ ...data, status });
        } else if (data.gstType === 'NON-GST') {
            if (!data.salesReturnNumber) {
                data.salesReturnNumber = await getNextSalesReturnNumber(data.salesReturnType || 'SALES_RETURN', data.gstType || 'GST');
            }
            const [existingNonGst] = await Promise.all([
                SalesReturnNonGst.findOne({ salesReturnNumber: data.salesReturnNumber })
            ]);

            if (existingNonGst) {
                throw new Error("Sales return number already exists")
            }

            salesReturn = await SalesReturnNonGst.create({ ...data, status });
        } else {
            throw new Error("Invalid GST Type")
        }

        createProductReturnFromSalesReturn(salesReturn.toObject ? salesReturn.toObject() : salesReturn)
            .then(productReturn => {
                console.log(`Product return ${productReturn.productReturnNumber} created for sales return ${salesReturn.salesReturnNumber}`);
            })
            .catch(error => {
                console.error('Failed to create product return:', error);
            });

        return salesReturn;

    } catch (error: any) {
        throw new Error(error.message)
    }
};

export const getAllSalesReturn = async (filters: FilterOptions = {}) => {
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
            if (dateQuery) query.salesReturnDate = dateQuery;
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
            query.salesReturnDate = dq;
        }

        const skip = (page - 1) * limit;

        // =========================
        // GST ONLY
        // =========================
        if (gstType === "GST") {
            const result = await SalesReturnGst.aggregate([
                ...buildSalesReturnAggregation(query, search, "GST"),
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
            const result = await SalesReturnNonGst.aggregate([
                ...buildSalesReturnAggregation(query, search, "NON-GST"),
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
            SalesReturnGst.aggregate(buildSalesReturnAggregation(query, search)),
            SalesReturnNonGst.aggregate(buildSalesReturnAggregation(query, search))
        ]);

        const combined = [...gstDocs, ...nonGstDocs].sort(
            (a, b) => new Date(b.salesReturnDate).getTime() - new Date(a.salesReturnDate).getTime()
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
        console.error("Error in getAllSalesReturn:", error);
        throw new Error(error.message || "Failed to fetch sales returns");
    }
};

// Get next available sales return  number (for display only)
export const getNextSalesReturnNumber = async (salesReturnType: string = "SALES_RETURN", gstType: GstType = 'GST'): Promise<string> => {
    let prefix = "SR";
    try {

        if (salesReturnType && gstType === "NON-GST") {
            // Find the last sales return  number from both GST and NON-GST collections
            const [lastNonGstSalesReturn] = await Promise.all([
                SalesReturnNonGst.findOne({
                    salesReturnNumber: { $regex: `^${prefix}${financialYear}-` }
                }).sort({ createdAt: -1 }).select('salesReturnNumber')
            ]);

            // Get the highest sequence number from both collections
            let maxSequence = 0;

            [lastNonGstSalesReturn].forEach(sr => {
                if (sr && sr.salesReturnNumber) {
                    const match = sr.salesReturnNumber.match(/-(\d+)$/);
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
        } if (salesReturnType && gstType === "GST") {
            // Find the last sales return  number from both GST and NON-GST collections
            const [lastGstSalesReturn] = await Promise.all([
                SalesReturnGst.findOne({
                    salesReturnNumber: { $regex: `^${prefix}${financialYear}-` }
                }).sort({ createdAt: -1 }).select('salesReturnNumber'),
            ]);

            // Get the highest sequence number from both collections
            let maxSequence = 0;

            [lastGstSalesReturn].forEach(sr => {
                if (sr && sr.salesReturnNumber) {
                    const match = sr.salesReturnNumber.match(/-(\d+)$/);
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
        throw new Error("Invalid GST Type or sales return Type")
    } catch (error: any) {
        console.error("Error getting next sales return number:", error);
        // If no sales return s exist yet, start from 1
        return `${prefix}${financialYear}-1`;
    }
};

// Get specific sales return  by ID
export const getSalesReturnById = async (id: string) => {
    try {
        // Try to find in GST sales return s
        const gstSalesReturn = await SalesReturnGst.findById(id).populate('party');
        if (gstSalesReturn) return gstSalesReturn;

        // Try to find in NON-GST sales return s
        const nonGstSalesReturn = await SalesReturnNonGst.findById(id).populate('party');
        if (nonGstSalesReturn) return nonGstSalesReturn;

        throw new Error("Sales return not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// Update sales return 
export const updateSalesReturn = async (id: string, data: Partial<ISalesReturn>) => {
    try {
        const status = getInvoiceStatus(data.receivedAmount, data.totalAmount);
        // Try to update in GST sales return s
        const gstSalesReturn = await SalesReturnGst.findById(id);
        if (gstSalesReturn) {
            return await SalesReturnGst.findByIdAndUpdate(id, { ...data, status }, { new: true });
        }

        // Try to update in NON-GST sales return s
        const nonGstSalesReturn = await SalesReturnNonGst.findById(id);
        if (nonGstSalesReturn) {
            return await SalesReturnNonGst.findByIdAndUpdate(id, { ...data, status }, { new: true });
        }

        throw new Error("Sales return not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// Delete sales return 
export const deleteSalesReturn = async (id: string) => {
    try {
        // Try to delete from GST sales return s
        const gstSalesReturn = await SalesReturnGst.findByIdAndDelete(id);
        if (gstSalesReturn) return gstSalesReturn;

        // Try to delete from NON-GST sales return s
        const nonGstSalesReturn = await SalesReturnNonGst.findByIdAndDelete(id);
        if (nonGstSalesReturn) return nonGstSalesReturn;

        throw new Error("Sales return not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};