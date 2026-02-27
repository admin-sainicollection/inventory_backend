// salesInvoice.service.ts
import InvoiceGst from "./salesInvoice.gst.model";
import InvoiceNonGst from "./salesInvoice.non_gst.model";
import { FilterOptions, GstType, IInvoice } from "../types";
import { useFinancialYear } from "../../../utils/useFinancialYear";
import CreditNoteGst from "../creditNote/creditNote.gst.model";
import CreditNoteNonGst from "../creditNote/creditNote.non_gst.model";
import SalesReturnGst from "../salesReturn/salesReturn.gst.model";
import SalesReturnNonGst from "../salesReturn/salesReturn.non_gst.model";
import { getInvoiceStatus } from "../../../utils/invoiceStatus";
import PaymentInNonGst from "../paymentIn/paymentIn.non_gst.model";
import PaymentInGst from "../paymentIn/paymentIn.gst.model";
import QuotationGst from "../quotation/quotation.gst.model";
import QuotationNonGst from "../quotation/quotation.non_gst.model";
import mongoose from "mongoose";
import { InvoiceHistory } from "../invoiceHistory/invoiceHistory.model";
import { detectInvoiceChanges } from "../../../utils/detectInvoiceChanges";
const financialYear = useFinancialYear();

// ======================================================================HELPER FUNCTION
const buildInvoiceAggregation = (
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
                    { invoiceNumber: regex },
                    { "party.partyName": regex },
                    { "party.nickName": regex },
                    { "party.gstNumber": regex }
                ]
            }
        });
    }

    pipeline.push({ $sort: { invoiceDate: -1 } });

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

export const updateQuotationStatus = async (quotationId: string, status: string) => {
    try {
        let quotation = await QuotationGst.findById(quotationId);
        let Model = QuotationGst;
        if (!quotation) {
            quotation = await QuotationNonGst.findById(quotationId);
            Model = QuotationNonGst;
        }
        if (!quotation) {
            throw new Error("Quotation not found")
        }
        return await Model.findByIdAndUpdate(
            quotationId,
            {
                status,
                isConverted: true,
                convertedAt: new Date()
            }, {
            new: true
        }
        )
    } catch (error) {
        throw error
    }
}

// ============================================================================SERVICES

export const createSalesInvoice = async (data: Partial<IInvoice>) => {
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

        let invoice;

        if (data.gstType === 'GST') {
            if (!data.invoiceNumber) {
                data.invoiceNumber = await getNextInvoiceNumber(data.invoiceType || 'INVOICE', data.gstType || 'GST');
            }

            const [existingGst] = await Promise.all([
                InvoiceGst.findOne({ invoiceNumber: data.invoiceNumber })
            ]);

            if (existingGst) {
                throw new Error("Invoice number already exists")
            }
            invoice = await InvoiceGst.create({ ...data, status });

        } else if (data.gstType === 'NON-GST') {
            if (!data.invoiceNumber) {
                data.invoiceNumber = await getNextInvoiceNumber(data.invoiceType || 'INVOICE');
            }
            const [existingNonGst] = await Promise.all([
                InvoiceNonGst.findOne({ invoiceNumber: data.invoiceNumber })
            ]);

            if (existingNonGst) {
                throw new Error("Invoice number already exists")
            }

            invoice = await InvoiceNonGst.create({ ...data, status });
        } else {
            throw new Error("Invalid GST Type")
        }

        // Create history entry for invoice creation
        if (invoice) {
            await InvoiceHistory.create({
                invoiceId: invoice._id.toString(),
                gstType: data.gstType,
                action: 'CREATE',
                changedAt: new Date(),
                changes: Object.keys(data).map(key => ({
                    field: key,
                    oldValue: null,
                    newValue: data[key as keyof IInvoice]
                })),
                notes: `Invoice ${invoice.invoiceNumber} created`,
                newStatus: status
            });

            // If there was an initial payment, add a payment history entry
            if (data.receivedAmount && data.receivedAmount > 0) {
                await InvoiceHistory.create({
                    invoiceId: invoice._id.toString(),
                    gstType: data.gstType,
                    action: 'PAYMENT_RECEIVED',
                    changedAt: new Date(),
                    changes: [{
                        field: 'paymentReferences',
                        oldValue: null,
                        newValue: { amount: data.receivedAmount }
                    }],
                    previousAmount: 0,
                    newAmount: data.receivedAmount,
                    notes: `Initial payment received: ₹${data.receivedAmount.toFixed(2)}`
                });
            }
        }

        // Handle quotation conversion if needed
        if (data.convertedFromQuotationId) {
            await updateQuotationStatus(data.convertedFromQuotationId, 'CONVERTED');
        }

        return invoice;
    } catch (error: any) {
        throw new Error(error.message)
    }
}

export const getAllSalesInvoice = async (filters: FilterOptions = {}) => {
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
            partyId // Add this
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

        if (dateRange && dateRange !== "all" && dateRange !== "custom") {
            const dateQuery = getDateRangeQuery(dateRange);
            if (dateQuery) query.invoiceDate = dateQuery;
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
            query.invoiceDate = dq;
        }

        const skip = (page - 1) * limit;

        // =========================
        // GST ONLY
        // =========================
        if (gstType === "GST") {
            const result = await InvoiceGst.aggregate([
                ...buildInvoiceAggregation(query, search),
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
            const result = await InvoiceNonGst.aggregate([
                ...buildInvoiceAggregation(query, search),
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
            InvoiceGst.aggregate(buildInvoiceAggregation(query, search)),
            InvoiceNonGst.aggregate(buildInvoiceAggregation(query, search))
        ]);

        const combined = [...gstDocs, ...nonGstDocs].sort(
            (a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
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
        console.error("Error in getAllSalesInvoice:", error);
        throw new Error(error.message || "Failed to fetch invoices");
    }
};



// Function to generate next invoice number based on last created invoice


// Get next available invoice number (for display only)
export const getNextInvoiceNumber = async (invoiceType: string = "INVOICE", gstType: GstType = 'GST'): Promise<string> => {
    let prefix = "INV";
    try {

        if (invoiceType && gstType === "NON-GST") {
            // Find the last invoice number from both GST and NON-GST collections
            const [lastNonGstInvoice] = await Promise.all([
                InvoiceNonGst.findOne({
                    invoiceNumber: { $regex: `^${prefix}${financialYear}-` }
                }).sort({ createdAt: -1 }).select('invoiceNumber')
            ]);

            // Get the highest sequence number from both collections
            let maxSequence = 0;

            [lastNonGstInvoice].forEach(invoice => {
                if (invoice && invoice.invoiceNumber) {
                    const match = invoice.invoiceNumber.match(/-(\d+)$/);
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
        } if (invoiceType && gstType === "GST") {
            // Find the last invoice number from both GST and NON-GST collections
            const [lastGstInvoice] = await Promise.all([
                InvoiceGst.findOne({
                    invoiceNumber: { $regex: `^${prefix}${financialYear}-` }
                }).sort({ createdAt: -1 }).select('invoiceNumber'),
            ]);

            // Get the highest sequence number from both collections
            let maxSequence = 0;

            [lastGstInvoice].forEach(invoice => {
                if (invoice && invoice.invoiceNumber) {
                    const match = invoice.invoiceNumber.match(/-(\d+)$/);
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
        throw new Error("Invalid GST Type or Invoice Type")
    } catch (error: any) {
        console.error("Error getting next invoice number:", error);
        // If no invoices exist yet, start from 1
        return `${prefix}${financialYear}-1`;
    }
};

// Get specific invoice by ID
export const getSalesInvoiceById = async (id: string) => {
    try {
        // Try to find in GST invoices
        const gstInvoice = await InvoiceGst.findById(id).populate('party');
        if (gstInvoice) return gstInvoice;

        // Try to find in NON-GST invoices
        const nonGstInvoice = await InvoiceNonGst.findById(id).populate('party');
        if (nonGstInvoice) return nonGstInvoice;

        throw new Error("Invoice not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// Update invoice
// export const updateSalesInvoice = async (id: string, data: Partial<IInvoice>) => {
//     try {
//         const status = data.status ?? getInvoiceStatus(data.receivedAmount, data.totalAmount)
//         // Try to update in GST invoices
//         const gstInvoice = await InvoiceGst.findById(id);
//         if (gstInvoice) {
//             return await InvoiceGst.findByIdAndUpdate(id, { ...data, status }, { new: true });
//         }

//         // Try to update in NON-GST invoices
//         const nonGstInvoice = await InvoiceNonGst.findById(id);
//         if (nonGstInvoice) {
//             return await InvoiceNonGst.findByIdAndUpdate(id, { ...data, status }, { new: true });
//         }

//         throw new Error("Invoice not found");
//     } catch (error: any) {
//         throw new Error(error.message);
//     }
// };

export const updateSalesInvoice = async (id: string, data: Partial<IInvoice>) => {
    try {
        const status = data.status ?? getInvoiceStatus(data.receivedAmount, data.totalAmount);

        // Find existing invoice
        let existingInvoice;
        let gstType;
        let Model;

        const gstInvoice = await InvoiceGst.findById(id);
        if (gstInvoice) {
            existingInvoice = gstInvoice.toObject();
            gstType = 'GST';
            Model = InvoiceGst;
        } else {
            const nonGstInvoice = await InvoiceNonGst.findById(id);
            if (nonGstInvoice) {
                existingInvoice = nonGstInvoice.toObject();
                gstType = 'NON-GST';
                Model = InvoiceNonGst;
            } else {
                throw new Error("Invoice not found");
            }
        }

        // Detect changes
        const fieldsToTrack = [
            'party', 'invoiceDate', 'dueDate', 'items', 'charges', 'discount',
            'notes', 'terms', 'paymentTerms', 'totalAmount', 'receivedAmount',
            'balanceAmount', 'taxBreakdown'
        ];

        const changes = detectInvoiceChanges(existingInvoice, data, fieldsToTrack);

        // Check for status change
        const oldStatus = existingInvoice.status;
        const newStatus = status;
        const isStatusChange = oldStatus !== newStatus;

        // Check for amount change
        const oldTotal = existingInvoice.totalAmount || 0;
        const newTotal = data.totalAmount ?? oldTotal;
        const isAmountChange = oldTotal !== newTotal;

        // Check for payment received
        const oldReceived = existingInvoice.receivedAmount || 0;
        const newReceived = data.receivedAmount ?? oldReceived;
        const isPaymentChange = oldReceived !== newReceived;

        // Update the invoice
        const updatedInvoice = await Model.findByIdAndUpdate(
            id,
            { ...data, status },
            { new: true }
        );

        // Create history entries
        if (changes.length > 0) {
            // General changes history
            await InvoiceHistory.create({
                invoiceId: id,
                gstType,
                action: 'UPDATE',
                changedAt: new Date(),
                changes,
                notes: `Invoice ${updatedInvoice?.invoiceNumber} updated`,
                metadata: { fields: changes.map(c => c.field) }
            });
        }

        // Status change history
        if (isStatusChange) {
            await InvoiceHistory.create({
                invoiceId: id,
                gstType,
                action: 'STATUS_CHANGE',
                changedAt: new Date(),
                changes: [{
                    field: 'status',
                    oldValue: oldStatus,
                    newValue: newStatus
                }],
                previousStatus: oldStatus,
                newStatus: newStatus,
                notes: `Status changed from ${oldStatus} to ${newStatus}`
            });
        }

        // Payment received history
        if (isPaymentChange && newReceived > oldReceived) {
            const paymentAmount = newReceived - oldReceived;
            await InvoiceHistory.create({
                invoiceId: id,
                gstType,
                action: 'PAYMENT_RECEIVED',
                changedAt: new Date(),
                changes: [{
                    field: 'receivedAmount',
                    oldValue: oldReceived,
                    newValue: newReceived
                }],
                previousAmount: oldReceived,
                newAmount: newReceived,
                notes: `Payment received: ₹${paymentAmount.toFixed(2)}`
            });
        }

        // Amount change history
        if (isAmountChange && !isPaymentChange) {
            await InvoiceHistory.create({
                invoiceId: id,
                gstType,
                action: 'UPDATE',
                changedAt: new Date(),
                changes: [{
                    field: 'totalAmount',
                    oldValue: oldTotal,
                    newValue: newTotal
                }],
                previousAmount: oldTotal,
                newAmount: newTotal,
                notes: `Total amount changed from ₹${oldTotal.toFixed(2)} to ₹${newTotal.toFixed(2)}`
            });
        }

        return updatedInvoice;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// Delete invoice
export const deleteSalesInvoice = async (id: string) => {
    try {
        const invoice = await getSalesInvoiceById(id);

        const [existingGstCn, existingNonGstCn, existingGstSr, existingNonGstSr, existingGstPi, existingNonGstPi] = await Promise.all([
            CreditNoteGst.findOne({ invoiceId: id }),
            CreditNoteNonGst.findOne({ invoiceId: id }),
            SalesReturnGst.findOne({ invoiceId: id }),
            SalesReturnNonGst.findOne({ invoiceId: id }),
            PaymentInGst.findOne({ invoiceId: id }),
            PaymentInNonGst.findOne({ invoiceId: id }),
        ]);

        if (existingGstCn || existingNonGstCn || existingGstSr || existingNonGstSr || existingGstPi || existingNonGstPi) {
            throw new Error(`Invoice having number ${invoice.invoiceNumber} is linked with other document. first unlink to delete`)
        }

        // Try to delete from GST invoices
        const gstInvoice = await InvoiceGst.findByIdAndDelete(id);
        if (gstInvoice) return gstInvoice;

        // Try to delete from NON-GST invoices
        const nonGstInvoice = await InvoiceNonGst.findByIdAndDelete(id);
        if (nonGstInvoice) return nonGstInvoice;

        throw new Error("Invoice not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};