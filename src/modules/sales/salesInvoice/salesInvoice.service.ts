// salesInvoice.service.ts
import InvoiceGst from "./salesInvoice.gst.model";
import InvoiceNonGst from "./salesInvoice.non_gst.model";
import InvoiceCounter from "./invoiceCounter.model";
import { FilterOptions, IInvoice } from "./salesInvoice.types";
import mongoose from "mongoose";
import Party from '../../party/party.model'

export const createSalesInvoice = async (data: Partial<IInvoice>) => {
    try {
        if (!data.gstType) {
            throw new Error("GST type is required")
        }

        // Generate invoice number if not provided
        if (!data.invoiceNumber) {
            data.invoiceNumber = await generateNextInvoiceNumber(data.invoiceType || 'INVOICE');
        }

        // Check for duplicate invoice number
        const [existingGst, existingNonGst] = await Promise.all([
            InvoiceGst.findOne({ invoiceNumber: data.invoiceNumber }),
            InvoiceNonGst.findOne({ invoiceNumber: data.invoiceNumber })
        ]);

        if (existingGst || existingNonGst) {
            throw new Error("Invoice number already exists")
        }

        if (data.gstType === 'GST') {
            return await InvoiceGst.create(data);
        }

        if (data.gstType === 'NON-GST') {
            return await InvoiceNonGst.create(data);
        }

        throw new Error("Invalid GST Type")
    } catch (error: any) {
        throw new Error(error.message)
    }
}

// Updated getAllSalesInvoice service
export const getAllSalesInvoice = async (filters: FilterOptions = {}) => {
    try {
        const { gstType, limit = 50, page = 1, search, status, startDate, endDate, dateRange } = filters;
        const query: any = {};


        // Search functionality - FIXED
        if (search && search.trim() !== "") {
            const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            query.$or = [
                { invoiceNumber: { $regex: searchRegex } },
                // These will work when party is populated
                { 'party.partyName': { $regex: searchRegex } },
                { 'party.nickName': { $regex: searchRegex } }
            ];
        }

        // Status filter
        if (status && status !== 'all') {
            query.status = status;
        }

        // Date handling - FIXED variable scope issue
        let dateQuery: { $gte?: Date; $lte?: Date } = {};

        // Handle predefined date ranges
        if (dateRange && dateRange !== 'all' && dateRange !== 'custom') {
            const now = new Date();
            const startOfDay = new Date(now.setHours(0, 0, 0, 0));
            const endOfDay = new Date(now.setHours(23, 59, 59, 999));

            switch (dateRange) {
                case 'today':
                    dateQuery = {
                        $gte: startOfDay,
                        $lte: endOfDay
                    };
                    break;
                case 'yesterday':
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const startYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
                    const endYesterday = new Date(yesterday.setHours(23, 59, 59, 999));
                    dateQuery = {
                        $gte: startYesterday,
                        $lte: endYesterday
                    };
                    break;
                case 'this_week':
                    const today = new Date();
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay());
                    startOfWeek.setHours(0, 0, 0, 0);
                    const endOfWeek = new Date(today);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);
                    endOfWeek.setHours(23, 59, 59, 999);
                    dateQuery = {
                        $gte: startOfWeek,
                        $lte: endOfWeek
                    };
                    break;
                case 'this_month':
                    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    lastDay.setHours(23, 59, 59, 999);
                    dateQuery = {
                        $gte: firstDay,
                        $lte: lastDay
                    };
                    break;
                case 'last_month':
                    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
                    lastDayLastMonth.setHours(23, 59, 59, 999);
                    dateQuery = {
                        $gte: firstDayLastMonth,
                        $lte: lastDayLastMonth
                    };
                    break;
            }
        }

        // Manual date range (for custom dates) - FIXED: Use separate variable
        if (startDate || endDate) {
            const customDateQuery: { $gte?: Date; $lte?: Date } = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                customDateQuery.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                customDateQuery.$lte = end;
            }

            // Merge with existing dateQuery
            dateQuery = { ...dateQuery, ...customDateQuery };
        }

        // Apply date query if we have one
        if (Object.keys(dateQuery).length > 0) {
            query.invoiceDate = dateQuery;
        }

        const skip = (page - 1) * limit;

        // Simple function using Mongoose populate
        const getInvoicesSimple = async (Model: any, matchQuery: any, skipVal: number, limitVal: number) => {
            const [invoices, total] = await Promise.all([
                Model.find(matchQuery)
                    .sort({ invoiceDate: -1 })
                    .skip(skipVal)
                    .limit(limitVal)
                    .populate('party', 'partyName nickName entityCategory')
                    .lean(),
                Model.countDocuments(matchQuery)
            ]);

            return { invoices, total };
        };

        if (gstType === "GST") {
            const { invoices, total } = await getInvoicesSimple(InvoiceGst, query, skip, limit);
            return {
                data: invoices,
                total,
                page: Number(page),
                limit: Number(limit),
                totalPage: Math.ceil(total / limit)
            };
        }

        if (gstType === "NON-GST") {
            const { invoices, total } = await getInvoicesSimple(InvoiceNonGst, query, skip, limit);
            return {
                data: invoices,
                total,
                page: Number(page),
                limit: Number(limit),
                totalPage: Math.ceil(total / limit)
            };
        }

        // For both types
        const [gstResult, nonGstResult] = await Promise.all([
            getInvoicesSimple(InvoiceGst, query, skip, limit),
            getInvoicesSimple(InvoiceNonGst, query, skip, limit)
        ]);

        const combinedData = [...gstResult.invoices, ...nonGstResult.invoices]
            .sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime())
            .slice(0, limit);

        const total = gstResult.total + nonGstResult.total;

        return {
            data: combinedData,
            total,
            page: Number(page),
            limit: Number(limit),
            totalPage: Math.ceil(total / limit)
        };

    } catch (error: any) {
        console.error('Error in getAllSalesInvoice:', error);
        throw new Error(error.message || 'Failed to fetch invoices');
    }
};

// Function to generate next invoice number based on last created invoice
const generateNextInvoiceNumber = async (invoiceType: string = 'INVOICE'): Promise<string> => {
    try {
        let prefix = "INV";

        // Determine prefix based on invoice type
        switch (invoiceType) {
            case 'QUOTATION':
                prefix = 'QUO';
                break;
            case 'CREDIT_NOTE':
                prefix = 'CN';
                break;
            case 'DEBIT_NOTE':
                prefix = 'DN';
                break;
            case 'SALES_RETURN':
                prefix = 'SR';
                break;
            case 'PROFORMA':
                prefix = 'PRO';
                break;
            case 'PURCHASE_ORDER':
                prefix = 'PO';
                break;
            default:
                prefix = 'INV';
        }

        // Find the last invoice number from both GST and NON-GST collections
        const [lastGstInvoice, lastNonGstInvoice] = await Promise.all([
            InvoiceGst.findOne({
                invoiceNumber: { $regex: `^${prefix}-` }
            }).sort({ createdAt: -1 }).select('invoiceNumber'),
            InvoiceNonGst.findOne({
                invoiceNumber: { $regex: `^${prefix}-` }
            }).sort({ createdAt: -1 }).select('invoiceNumber')
        ]);

        // Get the highest sequence number from both collections
        let maxSequence = 0;

        [lastGstInvoice, lastNonGstInvoice].forEach(invoice => {
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

        // Increment for next invoice
        const nextSequence = maxSequence + 1;
        return `${prefix}-${String(nextSequence).padStart(4, "0")}`;

    } catch (error: any) {
        console.error("Error generating invoice number:", error);
        // Fallback to timestamp-based number
        const timestamp = Date.now().toString().slice(-6);
        return `INV-${timestamp}`;
    }
};

// Get next available invoice number (for display only)
export const getNextInvoiceNumber = async (invoiceType: string = "INVOICE"): Promise<string> => {
    let prefix = "INV";
    try {
        switch (invoiceType) {
            case 'QUOTATION':
                prefix = 'QUO';
                break;
            case 'CREDIT_NOTE':
                prefix = 'CN';
                break;
            case 'DEBIT_NOTE':
                prefix = 'DN';
                break;
            case 'SALES_RETURN':
                prefix = 'SR';
                break;
            case 'PROFORMA':
                prefix = 'PRO';
                break;
            case 'PURCHASE_ORDER':
                prefix = 'PO';
                break;
            default:
                prefix = 'INV';
        }

        // Find the last invoice number from both GST and NON-GST collections
        const [lastGstInvoice, lastNonGstInvoice] = await Promise.all([
            InvoiceGst.findOne({
                invoiceNumber: { $regex: `^${prefix}-` }
            }).sort({ createdAt: -1 }).select('invoiceNumber'),
            InvoiceNonGst.findOne({
                invoiceNumber: { $regex: `^${prefix}-` }
            }).sort({ createdAt: -1 }).select('invoiceNumber')
        ]);

        // Get the highest sequence number from both collections
        let maxSequence = 0;

        [lastGstInvoice, lastNonGstInvoice].forEach(invoice => {
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
        return `${prefix}-${String(nextSequence).padStart(0, "0")}`;

    } catch (error: any) {
        console.error("Error getting next invoice number:", error);
        // If no invoices exist yet, start from 1
        return `${prefix}-1`;
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
export const updateSalesInvoice = async (id: string, data: Partial<IInvoice>) => {
    try {
        // Try to update in GST invoices
        const gstInvoice = await InvoiceGst.findById(id);
        if (gstInvoice) {
            return await InvoiceGst.findByIdAndUpdate(id, data, { new: true });
        }

        // Try to update in NON-GST invoices
        const nonGstInvoice = await InvoiceNonGst.findById(id);
        if (nonGstInvoice) {
            return await InvoiceNonGst.findByIdAndUpdate(id, data, { new: true });
        }

        throw new Error("Invoice not found");
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// Delete invoice
export const deleteSalesInvoice = async (id: string) => {
    try {
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