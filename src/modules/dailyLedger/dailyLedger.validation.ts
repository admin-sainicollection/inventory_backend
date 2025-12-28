import z from 'zod';

export const addDailyLedgerValidation = z.object({
    partyId: z.string().trim().min(1, "Party ID is required"),

    date: z.string().optional(),

    withGST: z.boolean().optional().default(false),

    voucher: z.string().trim().optional(),

    sourceType: z.enum([
        "MANUAL",
        "SALES_INVOICE",
        "PURCHASE_INVOICE",
        "PAYMENT",
        "SALES_RETURN",
        "PURCHASE_RETURN",
        "OPENING_BALANCE",
    ]).default("MANUAL"),

    sourceId: z.string().trim().optional(),

    srNo: z.string().trim().optional(),

    credit: z.number().min(0, "Credit cannot be negative").optional(),

    debit: z.number().min(0, "Debit cannot be negative").optional(),

    description: z.string().optional(),

    // tdsDeductByParty: z.number().min(0, "TDS deducted by party cannot be negative").optional(),

    // tdsDeductBySelf: z.number().min(0, "TDS deducted by self cannot be negative").optional(),

    status: z.enum(["active", "inactive"]).default("active"),
});

export const updateDailyLedgerValidation = addDailyLedgerValidation.partial();