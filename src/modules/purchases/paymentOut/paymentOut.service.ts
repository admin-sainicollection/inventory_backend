import { FilterOptions, GstType, IPaymentOut } from "../types";
import { useFinancialYear } from "../../../utils/useFinancialYear";
import { getInvoiceStatus } from "../../../utils/invoiceStatus";
import mongoose from "mongoose";
import PaymentOutGst from "./paymentOut.gst.model";
import PurchaseGst from "../purchaseInvoice/purchaseInvoice.gst.model";
import PaymentOutNonGst from "./paymentOut.non_gst.model";
import PurchaseNonGst from "../purchaseInvoice/purchaseInvoice.non_gst.model";
const financialYear = useFinancialYear();

// ======================================================================HELPER FUNCTION
const buildPaymentOutAggregation = (
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

    // For GST payment ins, look up GST invoices
    if (gstType === 'GST') {
        pipeline.push({
            $lookup: {
                from: "purchasegsts",
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

    // For NON-GST payment ins, look up NON-GST invoices
    if (gstType === 'NON-GST') {
        pipeline.push({
            $lookup: {
                from: "purchasenongsts",  // Changed from "PaymentOutNonGsts" to "Purchasenongsts"
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
                    { paymentOutNumber: regex },
                    { "party.partyName": regex },
                    { "party.nickName": regex },
                    { "party.gstNumber": regex },
                    { "vendor.vendorName": regex },
                    { "purchase.purchaseNumber": regex },  // Add invoice number to search
                ]
            }
        });
    }

    pipeline.push({ $sort: { paymentOutDate: -1 } });

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


export const createPaymentOut = async (data: Partial<IPaymentOut>) => {
    try {
        if (!data.gstType) {
            throw new Error("GST type is required")
        }

        if (data.gstType === 'GST') {
            if (!data.paymentOutNumber) {
                data.paymentOutNumber = await getNextPaymentOutNumber(data.paymentOutType || 'PAYMENT_OUT', data.gstType || 'GST');
            }

            const [existingGst] = await Promise.all([
                PaymentOutGst.findOne({ paymentOutNumber: data.paymentOutNumber })
            ]);

            if (existingGst) {
                throw new Error("Payment Out number already exists")
            }

            // Get the invoice to check if it exists
            const invoice = await PurchaseGst.findById(data.purchaseId);
            if (!invoice) {
                throw new Error("Purchase Invoice not found");
            }

            // Create the payment in first
            const paymentOut = await PaymentOutGst.create(data);

            // Create simplified payment reference
            const paymentReference = {
                paymentOutId: paymentOut._id.toString(),
                amount: data.receivedAmount || 0
            };

            // Add reference to invoice's paymentReferences array
            const updatedInvoice = await PurchaseGst.findByIdAndUpdate(
                data.purchaseId,
                {
                    $push: { paymentReferences: paymentReference }
                },
                { new: true }
            );

            if (!updatedInvoice) {
                throw new Error("Failed to update invoice with payment reference");
            }

            // Calculate new totals
            // const totals = calculateInvoiceTotals(updatedInvoice, (data.receivedAmount || 0));
            const totalReferenceAmount = (invoice.paymentReferences || []).reduce(
                (sum, ref) => sum + (ref.amount || 0),
                0
            )
            const totalReceived = totalReferenceAmount + (invoice.receivedAmount || 0) + (data.receivedAmount || 0);

            const totalAmount = invoice.totalAmount || 0;
            const balanceAmount = Math.max(0, totalAmount - totalReceived);
            const status = getInvoiceStatus(totalReceived, totalAmount || 0);

            // Update invoice with calculated values
            await PurchaseGst.findByIdAndUpdate(
                data.purchaseId,
                {
                    // receivedAmount: totals.receivedAmount,
                    balanceAmount: balanceAmount,
                    status
                }
            );

            // Update payment in with settled amount
            await PaymentOutGst.findByIdAndUpdate(
                paymentOut._id,
                { settledAmount: totalReceived }
            );

            // Create history entry for payment
            // await InvoiceHistory.create({
            //     purchaseId: data.purchaseId as string,
            //     gstType: 'GST',
            //     action: 'PAYMENT_RECEIVED',
            //     changedAt: new Date(),
            //     changes: [{
            //         field: 'paymentReferences',
            //         oldValue: null,
            //         newValue: paymentReference
            //     }],
            //     previousAmount: invoice.receivedAmount || 0,
            //     newAmount: totalReceived,
            //     notes: `Payment received: ₹${(data.receivedAmount || 0).toFixed(2)} via ${data.paymentType} (Ref: ${paymentOut.paymentOutNumber})`,
            //     metadata: { paymentOutId: paymentOut._id }
            // });

            return paymentOut;
        }

        // Similar for NON-GST...
        if (data.gstType === 'NON-GST') {
            if (!data.paymentOutNumber) {
                data.paymentOutNumber = await getNextPaymentOutNumber(data.paymentOutType || 'PAYMENT_OUT', data.gstType || 'NON-GST');
            }

            const [existingNonGst] = await Promise.all([
                PaymentOutNonGst.findOne({ paymentOutNumber: data.paymentOutNumber })
            ]);

            if (existingNonGst) {
                throw new Error("Payment Out number already exists")
            }

            const invoice = await PurchaseNonGst.findById(data.purchaseId);
            if (!invoice) {
                throw new Error("Invoice not found");
            }

            const paymentOut = await PaymentOutNonGst.create(data);

            const paymentReference = {
                paymentOutId: paymentOut._id.toString(),
                amount: data.receivedAmount || 0
            };

            const updatedInvoice = await PurchaseNonGst.findByIdAndUpdate(
                data.purchaseId,
                {
                    $push: { paymentReferences: paymentReference }
                },
                { new: true }
            );

            if (!updatedInvoice) {
                throw new Error("Failed to update invoice with payment reference");
            }

            // const totals = calculateInvoiceTotals(updatedInvoice, (data.receivedAmount || 0));
            const totalReferenceAmount = (invoice.paymentReferences || []).reduce(
                (sum, ref) => sum + (ref.amount || 0),
                0
            )
            const totalReceived = totalReferenceAmount + (invoice.receivedAmount || 0) + (data.receivedAmount || 0);

            const totalAmount = invoice.totalAmount || 0;
            const balanceAmount = Math.max(0, totalAmount - totalReceived);
            const status = getInvoiceStatus(totalReceived, totalAmount || 0);

            await PurchaseNonGst.findByIdAndUpdate(
                data.purchaseId,
                {
                    // receivedAmount: totals.receivedAmount,
                    balanceAmount: balanceAmount,
                    status
                }
            );

            await PaymentOutNonGst.findByIdAndUpdate(
                paymentOut._id,
                { settledAmount: totalReceived }
            );

            // await InvoiceHistory.create({
            //     purchaseId: data.purchaseId as string,
            //     gstType: 'NON-GST',
            //     action: 'PAYMENT_RECEIVED',
            //     changedAt: new Date(),
            //     changes: [{
            //         field: 'paymentReferences',
            //         oldValue: null,
            //         newValue: paymentReference
            //     }],
            //     previousAmount: invoice.receivedAmount || 0,
            //     newAmount: totalReceived,
            //     notes: `Payment received: ₹${(data.receivedAmount || 0).toFixed(2)} via ${data.paymentType} (Ref: ${paymentOut.paymentOutNumber})`,
            //     metadata: { paymentOutId: paymentOut._id }
            // });

            return paymentOut;
        }

        throw new Error("Invalid GST Type")
    } catch (error: any) {
        throw new Error(error.message)
    }
};

export const getAllPaymentOut = async (filters: FilterOptions = {}) => {
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
            if (dateQuery) query.paymentOutDate = dateQuery;
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
            query.paymentOutDate = dq;
        }

        const skip = (page - 1) * limit;

        // =========================
        // GST ONLY
        // =========================
        if (gstType === "GST") {
            const result = await PaymentOutGst.aggregate([
                ...buildPaymentOutAggregation(query, search, "GST"),
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
            const result = await PaymentOutNonGst.aggregate([
                ...buildPaymentOutAggregation(query, search, "NON-GST"),
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
            PaymentOutGst.aggregate(buildPaymentOutAggregation(query, search)),
            PaymentOutNonGst.aggregate(buildPaymentOutAggregation(query, search))
        ]);

        const combined = [...gstDocs, ...nonGstDocs].sort(
            (a, b) => new Date(b.paymentOutDate).getTime() - new Date(a.paymentOutDate).getTime()
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
        console.error("Error in getAllPaymentOut:", error);
        throw new Error(error.message || "Failed to fetch payment out");
    }
};

// Get next available payment in number (for display only)
export const getNextPaymentOutNumber = async (paymentOutType: string = "PAYMENT_OUT", gstType: GstType = 'GST'): Promise<string> => {
    let prefix = "PO";
    try {

        if (paymentOutType && gstType === "NON-GST") {
            // Find the last payment in number from both GST and NON-GST collections
            const [lastNonGstPaymentOut] = await Promise.all([
                PaymentOutNonGst.findOne({
                    paymentOutNumber: { $regex: `^${prefix}${financialYear}-` }
                }).sort({ createdAt: -1 }).select('paymentOutNumber')
            ]);

            // Get the highest sequence number from both collections
            let maxSequence = 0;

            [lastNonGstPaymentOut].forEach(po => {
                if (po && po.paymentOutNumber) {
                    const match = po.paymentOutNumber.match(/-(\d+)$/);
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
        } if (paymentOutType && gstType === "GST") {
            // Find the last payment in number from both GST and NON-GST collections
            const [lastGstPaymentOut] = await Promise.all([
                PaymentOutGst.findOne({
                    paymentOutNumber: { $regex: `^${prefix}${financialYear}-` }
                }).sort({ createdAt: -1 }).select('paymentOutNumber'),
            ]);

            // Get the highest sequence number from both collections
            let maxSequence = 0;

            [lastGstPaymentOut].forEach(po => {
                if (po && po.paymentOutNumber) {
                    const match = po.paymentOutNumber.match(/-(\d+)$/);
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
        throw new Error("Invalid GST Type or payment out Type")
    } catch (error: any) {
        console.error("Error getting next Payment out number:", error);
        // If no payment ins exist yet, start from 1
        return `${prefix}${financialYear}-1`;
    }
};

// Get specific payment in by ID
export const getPaymentOutById = async (id: string) => {
    try {
        // Try to find in GST payment outs
        const gstPaymentOut = await PaymentOutGst.findById(id).populate('party').populate('vendor').populate('purchaseId');
        if (gstPaymentOut) return gstPaymentOut;

        // Try to find in NON-GST payment outs
        const nonGstPaymentOut = await PaymentOutNonGst.findById(id).populate('party').populate('vendor').populate('purchaseId');;
        if (nonGstPaymentOut) return nonGstPaymentOut;

        throw new Error("Payment In not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const updatePaymentOut = async (id: string, data: Partial<IPaymentOut>) => {
    try {
        // Try to update in GST payment ins
        const gstPaymentOut = await PaymentOutGst.findById(id);
        if (gstPaymentOut) {
            // Check if purchaseId exists
            if (!gstPaymentOut.purchaseId) {
                throw new Error("Invoice ID not found in payment record");
            }

            const oldAmount = gstPaymentOut.receivedAmount || 0;
            const newAmount = data.receivedAmount ?? oldAmount;
            const amountDiff = newAmount - oldAmount;

            // Get the invoice
            const invoice = await PurchaseGst.findById(gstPaymentOut.purchaseId);
            if (!invoice) {
                throw new Error("Invoice not found");
            }

            // Update the payment reference amount in invoice
            const updatedInvoice = await PurchaseGst.findOneAndUpdate(
                {
                    _id: gstPaymentOut.purchaseId,
                    "paymentReferences.paymentOutId": id
                },
                {
                    $set: {
                        "paymentReferences.$.amount": newAmount
                    }
                },
                { new: true }
            );

            if (!updatedInvoice) {
                throw new Error("Failed to update payment reference in invoice");
            }

            // Recalculate totals
            // const totals = calculateInvoiceTotals(updatedInvoice, (data.receivedAmount || 0));
            const totalReferenceAmount = (invoice.paymentReferences || []).reduce(
                (sum, ref) => sum + (ref.amount || 0),
                0
            )
            const totalReceived = totalReferenceAmount + (invoice.receivedAmount || 0) - oldAmount + (newAmount || 0);

            const totalAmount = invoice.totalAmount || 0;
            const balanceAmount = Math.max(0, totalAmount - totalReceived);
            const status = getInvoiceStatus(totalReceived, totalAmount || 0);

            // Update invoice with new totals
            await PurchaseGst.findByIdAndUpdate(
                gstPaymentOut.purchaseId,
                {
                    // receivedAmount: totals.receivedAmount,
                    balanceAmount: balanceAmount,
                    status
                }
            );

            // Update the payment in
            const updatedPaymentOut = await PaymentOutGst.findByIdAndUpdate(
                id,
                {
                    ...data,
                    settledAmount: totalReceived
                },
                { new: true }
            );

            // Create history entry if amount changed
            // if (amountDiff !== 0) {
            //     await InvoiceHistory.create({
            //         purchaseId: gstPaymentOut.purchaseId.toString(),
            //         gstType: 'GST',
            //         action: 'PAYMENT_RECEIVED',
            //         changedAt: new Date(),
            //         changes: [{
            //             field: 'paymentReferences',
            //             oldValue: { amount: oldAmount },
            //             newValue: { amount: newAmount }
            //         }],
            //         previousAmount: invoice.receivedAmount || 0,
            //         newAmount: totalReceived,
            //         notes: `Payment updated: ${amountDiff > 0 ? '+' : '-'}₹${Math.abs(amountDiff).toFixed(2)}`,
            //         metadata: { paymentOutId: id }
            //     });
            // }

            return updatedPaymentOut;
        }

        // Similar for NON-GST...
        const nonGstPaymentOut = await PaymentOutNonGst.findById(id);
        if (nonGstPaymentOut) {
            // Check if purchaseId exists
            if (!nonGstPaymentOut.purchaseId) {
                throw new Error("Invoice ID not found in payment record");
            }

            const oldAmount = nonGstPaymentOut.receivedAmount || 0;
            const newAmount = data.receivedAmount ?? oldAmount;
            const amountDiff = newAmount - oldAmount;

            const invoice = await PurchaseNonGst.findById(nonGstPaymentOut.purchaseId);
            if (!invoice) {
                throw new Error("Invoice not found");
            }

            const updatedInvoice = await PurchaseNonGst.findOneAndUpdate(
                {
                    _id: nonGstPaymentOut.purchaseId,
                    "paymentReferences.paymentOutId": id
                },
                {
                    $set: {
                        "paymentReferences.$.amount": newAmount
                    }
                },
                { new: true }
            );

            if (!updatedInvoice) {
                throw new Error("Failed to update payment reference in invoice");
            }

            // const totals = calculateInvoiceTotals(updatedInvoice, (data.receivedAmount || 0));
            const totalReferenceAmount = (invoice.paymentReferences || []).reduce(
                (sum, ref) => sum + (ref.amount || 0),
                0
            )
            const totalReceived = totalReferenceAmount + (invoice.receivedAmount || 0) - oldAmount + (newAmount || 0);

            const totalAmount = invoice.totalAmount || 0;
            const balanceAmount = Math.max(0, totalAmount - totalReceived);
            const status = getInvoiceStatus(totalReceived, totalAmount || 0);

            await PurchaseNonGst.findByIdAndUpdate(
                nonGstPaymentOut.purchaseId,
                {
                    // receivedAmount: totals.receivedAmount,
                    balanceAmount: balanceAmount,
                    status
                }
            );

            const updatedPaymentOut = await PaymentOutNonGst.findByIdAndUpdate(
                id,
                {
                    ...data,
                    settledAmount: totalReceived
                },
                { new: true }
            );

            // if (amountDiff !== 0) {
            //     await InvoiceHistory.create({
            //         purchaseId: nonGstPaymentOut.purchaseId.toString(),
            //         gstType: 'NON-GST',
            //         action: 'PAYMENT_RECEIVED',
            //         changedAt: new Date(),
            //         changes: [{
            //             field: 'paymentReferences',
            //             oldValue: { amount: oldAmount },
            //             newValue: { amount: newAmount }
            //         }],
            //         previousAmount: invoice.receivedAmount || 0,
            //         newAmount: totalReceived,
            //         notes: `Payment updated: ${amountDiff > 0 ? '+' : '-'}₹${Math.abs(amountDiff).toFixed(2)}`,
            //         metadata: { paymentOutId: id }
            //     });
            // }

            return updatedPaymentOut;
        }

        throw new Error("Payment Out not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const deletePaymentOut = async (id: string) => {
    try {
        // Try to delete from GST
        const gstPaymentOut = await PaymentOutGst.findById(id);
        if (gstPaymentOut) {
            // Check if purchaseId exists
            if (!gstPaymentOut.purchaseId) {
                throw new Error("Invoice ID not found in payment record");
            }

            // Remove payment reference from invoice
            const updatedInvoice = await PurchaseGst.findByIdAndUpdate(
                gstPaymentOut.purchaseId,
                {
                    $pull: {
                        paymentReferences: { paymentOutId: id }
                    }
                },
                { new: true }
            );

            const invoice = await PurchaseGst.findById(gstPaymentOut.purchaseId);

            if (updatedInvoice) {
                // Recalculate totals
                // const totals = calculateInvoiceTotals(updatedInvoice, (gstPaymentOut.receivedAmount || 0));
                const totalReferenceAmount = (invoice?.paymentReferences || []).reduce(
                    (sum, ref) => sum + (ref.amount || 0),
                    0
                )
                const totalReceived = totalReferenceAmount + (invoice?.receivedAmount || 0);

                const totalAmount = invoice?.totalAmount || 0;
                const balanceAmount = Math.max(0, totalAmount - totalReceived);
                const status = getInvoiceStatus(totalReceived, totalAmount || 0);

                // Update invoice with new totals
                await PurchaseGst.findByIdAndUpdate(
                    gstPaymentOut.purchaseId,
                    {
                        // receivedAmount: totals.receivedAmount,
                        balanceAmount: balanceAmount,
                        status
                    }
                );
            }

            // Delete the payment in
            await PaymentOutGst.findByIdAndDelete(id);

            // Create history entry
            // await InvoiceHistory.create({
            //     purchaseId: gstPaymentOut.purchaseId.toString(),
            //     gstType: 'GST',
            //     action: 'UPDATE',
            //     changedAt: new Date(),
            //     changes: [{
            //         field: 'paymentReferences',
            //         oldValue: { paymentOutId: id, amount: gstPaymentOut.receivedAmount || 0 },
            //         newValue: null
            //     }],
            //     notes: `Payment reference removed: ${gstPaymentOut.paymentOutNumber}`,
            //     metadata: { paymentOutId: id }
            // });

            return { success: true, message: "Payment Out deleted successfully" };
        }

        // Similar for NON-GST...
        const nonGstPaymentOut = await PaymentOutNonGst.findById(id);
        if (nonGstPaymentOut) {
            // Check if purchaseId exists
            if (!nonGstPaymentOut.purchaseId) {
                throw new Error("Invoice ID not found in payment record");
            }

            const updatedInvoice = await PurchaseNonGst.findByIdAndUpdate(
                nonGstPaymentOut.purchaseId,
                {
                    $pull: {
                        paymentReferences: { paymentOutId: id }
                    }
                },
                { new: true }
            );

            const invoice = await PurchaseNonGst.findById(nonGstPaymentOut.purchaseId);

            if (updatedInvoice) {
                // const totals = calculateInvoiceTotals(updatedInvoice, (nonGstPaymentOut.receivedAmount || 0));
                const totalReferenceAmount = (invoice?.paymentReferences || []).reduce(
                    (sum, ref) => sum + (ref.amount || 0),
                    0
                )
                const totalReceived = totalReferenceAmount + (invoice?.receivedAmount || 0);

                const totalAmount = invoice?.totalAmount || 0;
                const balanceAmount = Math.max(0, totalAmount - totalReceived);
                const status = getInvoiceStatus(totalReceived, totalAmount || 0);
                await PurchaseNonGst.findByIdAndUpdate(
                    nonGstPaymentOut.purchaseId,
                    {
                        // receivedAmount: totals.receivedAmount,
                        balanceAmount: balanceAmount,
                        status
                    }
                );
            }

            await PaymentOutNonGst.findByIdAndDelete(id);

            // await InvoiceHistory.create({
            //     purchaseId: nonGstPaymentOut.purchaseId.toString(),
            //     gstType: 'NON-GST',
            //     action: 'UPDATE',
            //     changedAt: new Date(),
            //     changes: [{
            //         field: 'paymentReferences',
            //         oldValue: { paymentOutId: id, amount: nonGstPaymentOut.receivedAmount || 0 },
            //         newValue: null
            //     }],
            //     notes: `Payment reference removed: ${nonGstPaymentOut.paymentOutNumber}`,
            //     metadata: { paymentOutId: id }
            // });

            return { success: true, message: "Payment Out deleted successfully" };
        }

        throw new Error("Payment Out not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};