import { GstType, IQuotation } from "../types";
import QuotationGst from "./quotation.gst.model";
import QuotationNonGst from "./quotation.non_gst.model";
import { useFinancialYear } from "../../../utils/useFinancialYear";
const financialYear = useFinancialYear();

export const createQuotation = async (data: Partial<IQuotation>) => {
    try {
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
            return await QuotationGst.create(data);
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
            return await QuotationNonGst.create(data);
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
            // Find the last invoice number from both GST and NON-GST collections
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
            // Find the last invoice number from both GST and NON-GST collections
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
        console.error("Error getting next invoice number:", error);
        // If no invoices exist yet, start from 1
        return `${prefix}${financialYear}-1`;
    }
};