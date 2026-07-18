import z from 'zod';

export const addVendorDailyLedgerValidation = z.object({
    vendorId: z.string().trim().min(1, "Vendor ID is required"),

    date: z.string().optional(),

    srNo: z.string().trim().optional(),

    voucher: z.string().trim().optional(),

    credit: z.number().min(0, "Credit cannot be negative").optional(),

    debit: z.number().min(0, "Debit cannot be negative").optional(),

    description: z.string().optional(),

    // tdsDeductByParty: z.number().min(0, "TDS deducted by party cannot be negative").optional(),

    // tdsDeductBySelf: z.number().min(0, "TDS deducted by self cannot be negative").optional(),

    status: z.enum(["active", "inactive"]).default("active"),
});

export const updateVendorDailyLedgerValidation = addVendorDailyLedgerValidation.partial();