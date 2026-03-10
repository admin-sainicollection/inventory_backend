// salesInvoice.service.ts
import { FilterOptions, GstType, IPurchase } from "../types";
import { useFinancialYear } from "../../../utils/useFinancialYear";
import { getInvoiceStatus } from "../../../utils/invoiceStatus";
import mongoose from "mongoose";
import { detectInvoiceChanges } from "../../../utils/detectInvoiceChanges";
import PurchaseNonGst from "./purchaseInvoice.non_gst.model";
import PurchaseGst from "./purchaseInvoice.gst.model";
const financialYear = useFinancialYear();

// ======================================================================HELPER FUNCTION
const buildPurchaseAggregation = (
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
                    { purchaseNumber: regex },
                    { "party.partyName": regex },
                    { "party.nickName": regex },
                    { "party.gstNumber": regex },
                    { "vendor.vendorName": regex },
                    { "vendor.nickName": regex },
                    { "vendor.gstNumber": regex }
                ]
            }
        });
    }

    pipeline.push({ $sort: { purchaseDate: -1 } });

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

export const createPurchaseInvoice = async (data: Partial<IPurchase>) => {
    try {
        // If receivedAmount is provided at creation, add it as a payment reference
        // if (data.receivedAmount && data.receivedAmount > 0) {
        //     const paymentReference = {
        //         paymentInId: 'initial', // Mark as initial payment
        //         amount: data.receivedAmount
        //     };

        //     data.paymentReferences = [paymentReference];
        // }

        const status = getInvoiceStatus(data.receivedAmount, data.totalAmount)

        if (!data.gstType) {
            throw new Error("GST type is required")
        }

        let purchase;

        if (data.gstType === 'GST') {
            if (!data.purchaseNumber) {
                data.purchaseNumber = await getNextPurchaseNumber(data.purchaseType || 'PURCHASE', data.gstType || 'GST');
            }

            const [existingGst] = await Promise.all([
                PurchaseGst.findOne({ purchaseNumber: data.purchaseNumber })
            ]);

            if (existingGst) {
                throw new Error("Purchase number already exists")
            }
            purchase = await PurchaseGst.create({
                ...data, party: data.party && data.party.trim() !== '' ? data.party : null,
                vendor: data.vendor && data.vendor.trim() !== '' ? data.vendor : null, status
            });

        } else if (data.gstType === 'NON-GST') {
            if (!data.purchaseNumber) {
                data.purchaseNumber = await getNextPurchaseNumber(data.purchaseType || 'PURCHASE');
            }
            const [existingNonGst] = await Promise.all([
                PurchaseNonGst.findOne({ purchaseNumber: data.purchaseNumber })
            ]);

            if (existingNonGst) {
                throw new Error("Purchase number already exists")
            }

            purchase = await PurchaseNonGst.create({
                ...data, party: data.party && data.party.trim() !== '' ? data.party : null,
                vendor: data.vendor && data.vendor.trim() !== '' ? data.vendor : null, status
            });
        } else {
            throw new Error("Invalid GST Type")
        }

        // Create history entry for invoice creation
        // if (invoice) {
        //     await InvoiceHistory.create({
        //         purchaseId: invoice._id.toString(),
        //         gstType: data.gstType,
        //         action: 'CREATE',
        //         changedAt: new Date(),
        //         changes: Object.keys(data).map(key => ({
        //             field: key,
        //             oldValue: null,
        //             newValue: data[key as keyof IPurchase]
        //         })),
        //         notes: `Invoice ${invoice.purchaseNumber} created`,
        //         newStatus: status
        //     });

        //     // If there was an initial payment, add a payment history entry
        //     if (data.receivedAmount && data.receivedAmount > 0) {
        //         await InvoiceHistory.create({
        //             purchaseId: invoice._id.toString(),
        //             gstType: data.gstType,
        //             action: 'PAYMENT_RECEIVED',
        //             changedAt: new Date(),
        //             changes: [{
        //                 field: 'paymentReferences',
        //                 oldValue: null,
        //                 newValue: { amount: data.receivedAmount }
        //             }],
        //             previousAmount: 0,
        //             newAmount: data.receivedAmount,
        //             notes: `Initial payment received: ₹${data.receivedAmount.toFixed(2)}`
        //         });
        //     }
        // }


        return purchase;
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export const getAllPurchaseInvoice = async (filters: FilterOptions = {}) => {
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

        // ADD PARTY FILTER HERE
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
            if (dateQuery) query.purchaseDate = dateQuery;
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
            query.purchaseDate = dq;
        }

        const skip = (page - 1) * limit;

        // =========================
        // GST ONLY
        // =========================
        if (gstType === "GST") {
            const result = await PurchaseGst.aggregate([
                ...buildPurchaseAggregation(query, search),
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
            const result = await PurchaseNonGst.aggregate([
                ...buildPurchaseAggregation(query, search),
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
            PurchaseGst.aggregate(buildPurchaseAggregation(query, search)),
            PurchaseNonGst.aggregate(buildPurchaseAggregation(query, search))
        ]);

        const combined = [...gstDocs, ...nonGstDocs].sort(
            (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
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
        console.error("Error in getAllPurchaseInvoice:", error);
        throw new Error(error.message || "Failed to fetch purchase invoices");
    }
};


// Get next available purchase number (for display only)
export const getNextPurchaseNumber = async (purchaseType: string = "PURCHASE", gstType: GstType = 'GST'): Promise<string> => {
    let prefix = "PC";
    try {

        if (purchaseType && gstType === "NON-GST") {
            // Find the last purchase number from both GST and NON-GST collections
            const [lastNonGstPurchase] = await Promise.all([
                PurchaseNonGst.findOne({
                    purchaseNumber: { $regex: `^${prefix}${financialYear}-` }
                }).sort({ createdAt: -1 }).select('purchaseNumber')
            ]);

            // Get the highest sequence number from both collections
            let maxSequence = 0;

            [lastNonGstPurchase].forEach(purchase => {
                if (purchase && purchase.purchaseNumber) {
                    const match = purchase.purchaseNumber.match(/-(\d+)$/);
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
        } if (purchaseType && gstType === "GST") {
            // Find the last purchase number from both GST and NON-GST collections
            const [lastGstPurchase] = await Promise.all([
                PurchaseGst.findOne({
                    purchaseNumber: { $regex: `^${prefix}${financialYear}-` }
                }).sort({ createdAt: -1 }).select('purchaseNumber'),
            ]);

            // Get the highest sequence number from both collections
            let maxSequence = 0;

            [lastGstPurchase].forEach(purchase => {
                if (purchase && purchase.purchaseNumber) {
                    const match = purchase.purchaseNumber.match(/-(\d+)$/);
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
        throw new Error("Invalid GST Type or Purchase Type")
    } catch (error: any) {
        console.error("Error getting next purchase number:", error);
        // If no invoices exist yet, start from 1
        return `${prefix}${financialYear}-1`;
    }
};

// Get specific invoice by ID
export const getPurchaseInvoiceById = async (id: string) => {
    try {
        // Try to find in GST invoices
        const gstPurchase = await PurchaseGst.findById(id).populate('party').populate('vendor');
        if (gstPurchase) return gstPurchase;

        // Try to find in NON-GST invoices
        const nonGstPurchase = await PurchaseNonGst.findById(id).populate('party').populate('vendor');
        if (nonGstPurchase) return nonGstPurchase;

        throw new Error("Purchase Invoice not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// Update invoice
// export const updatePurchaseInvoice = async (id: string, data: Partial<IPurchase>) => {
//     try {
//         const status = data.status ?? getInvoiceStatus(data.receivedAmount, data.totalAmount)
//         // Try to update in GST invoices
//         const gstPurchase = await PurchaseGst.findById(id);
//         if (gstPurchase) {
//             return await PurchaseGst.findByIdAndUpdate(id, { ...data, status }, { new: true });
//         }

//         // Try to update in NON-GST invoices
//         const nonGstPurchase = await PurchaseNonGst.findById(id);
//         if (nonGstPurchase) {
//             return await PurchaseNonGst.findByIdAndUpdate(id, { ...data, status }, { new: true });
//         }

//         throw new Error("Invoice not found");
//     } catch (error: any) {
//         throw new Error(error.message);
//     }
// };

export const updatePurchaseInvoice = async (id: string, data: Partial<IPurchase>) => {
    try {
        const status = data.status ?? getInvoiceStatus(data.receivedAmount, data.totalAmount);

        // Find existing invoice
        let existingPurchase;
        let gstType;
        let Model;

        const gstPurchase = await PurchaseGst.findById(id);
        if (gstPurchase) {
            existingPurchase = gstPurchase.toObject();
            gstType = 'GST';
            Model = PurchaseGst;
        } else {
            const nonGstPurchase = await PurchaseNonGst.findById(id);
            if (nonGstPurchase) {
                existingPurchase = nonGstPurchase.toObject();
                gstType = 'NON-GST';
                Model = PurchaseNonGst;
            } else {
                throw new Error("Invoice not found");
            }
        }

        // Detect changes
        const fieldsToTrack = [
            'party', 'purchaseDate', 'dueDate', 'items', 'charges', 'discount',
            'notes', 'terms', 'paymentTerms', 'totalAmount', 'receivedAmount',
            'balanceAmount', 'taxBreakdown', 'vendor'
        ];

        const changes = detectInvoiceChanges(existingPurchase, data, fieldsToTrack);

        // Check for status change
        const oldStatus = existingPurchase.status;
        const newStatus = status;
        // const isStatusChange = oldStatus !== newStatus;

        // Check for amount change
        const oldTotal = existingPurchase.totalAmount || 0;
        const newTotal = data.totalAmount ?? oldTotal;
        // const isAmountChange = oldTotal !== newTotal;

        // Check for payment received
        const oldReceived = existingPurchase.receivedAmount || 0;
        const newReceived = data.receivedAmount ?? oldReceived;
        // const isPaymentChange = oldReceived !== newReceived;

        // Update the invoice
        const updatedPurchase = await Model.findByIdAndUpdate(
            id,
            { ...data, status },
            { new: true }
        );

        // Create history entries
        // if (changes.length > 0) {
        //     // General changes history
        //     await InvoiceHistory.create({
        //         purchaseId: id,
        //         gstType,
        //         action: 'UPDATE',
        //         changedAt: new Date(),
        //         changes,
        //         notes: `Invoice ${updatedPurchase?.purchaseNumber} updated`,
        //         metadata: { fields: changes.map(c => c.field) }
        //     });
        // }

        // // Status change history
        // if (isStatusChange) {
        //     await InvoiceHistory.create({
        //         purchaseId: id,
        //         gstType,
        //         action: 'STATUS_CHANGE',
        //         changedAt: new Date(),
        //         changes: [{
        //             field: 'status',
        //             oldValue: oldStatus,
        //             newValue: newStatus
        //         }],
        //         previousStatus: oldStatus,
        //         newStatus: newStatus,
        //         notes: `Status changed from ${oldStatus} to ${newStatus}`
        //     });
        // }

        // Payment received history
        // if (isPaymentChange && newReceived > oldReceived) {
        //     const paymentAmount = newReceived - oldReceived;
        //     await InvoiceHistory.create({
        //         purchaseId: id,
        //         gstType,
        //         action: 'PAYMENT_RECEIVED',
        //         changedAt: new Date(),
        //         changes: [{
        //             field: 'receivedAmount',
        //             oldValue: oldReceived,
        //             newValue: newReceived
        //         }],
        //         previousAmount: oldReceived,
        //         newAmount: newReceived,
        //         notes: `Payment received: ₹${paymentAmount.toFixed(2)}`
        //     });
        // }

        // // Amount change history
        // if (isAmountChange && !isPaymentChange) {
        //     await InvoiceHistory.create({
        //         purchaseId: id,
        //         gstType,
        //         action: 'UPDATE',
        //         changedAt: new Date(),
        //         changes: [{
        //             field: 'totalAmount',
        //             oldValue: oldTotal,
        //             newValue: newTotal
        //         }],
        //         previousAmount: oldTotal,
        //         newAmount: newTotal,
        //         notes: `Total amount changed from ₹${oldTotal.toFixed(2)} to ₹${newTotal.toFixed(2)}`
        //     });
        // }

        return updatedPurchase;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// Delete invoice
export const deletePurchaseInvoice = async (id: string) => {
    try {
        const invoice = await getPurchaseInvoiceById(id);

        // const [existingGstCn, existingNonGstCn, existingGstSr, existingNonGstSr, existingGstPi, existingNonGstPi] = await Promise.all([
        //     CreditNoteGst.findOne({ purchaseId: id }),
        //     CreditNoteNonGst.findOne({ purchaseId: id }),
        //     SalesReturnGst.findOne({ purchaseId: id }),
        //     SalesReturnNonGst.findOne({ purchaseId: id }),
        //     PaymentInGst.findOne({ purchaseId: id }),
        //     PaymentInNonGst.findOne({ purchaseId: id }),
        // ]);

        // if (existingGstCn || existingNonGstCn || existingGstSr || existingNonGstSr || existingGstPi || existingNonGstPi) {
        //     throw new Error(`Invoice having number ${invoice.purchaseNumber} is linked with other document. first unlink to delete`)
        // }

        // Try to delete from GST invoices
        const gstPurchase = await PurchaseGst.findByIdAndDelete(id);
        if (gstPurchase) return gstPurchase;

        // Try to delete from NON-GST invoices
        const nonGstPurchase = await PurchaseNonGst.findByIdAndDelete(id);
        if (nonGstPurchase) return nonGstPurchase;

        throw new Error("Invoice not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};