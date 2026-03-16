import z from "zod";

const DiscountSchema = z.object({
  type: z.enum(['before_tax', 'after_tax']).default('before_tax'),
  amount: z.number().nonnegative().default(0),
  isPercentage: z.boolean().default(false)
}).nullable().default(null);

// Single schema with conditional validation
export const paymentOutBaseSchema = z.object({
    paymentOutType: z.enum(['PURCHASE', 'PURCHASE_RETURN', 'DEBIT_NOTE', 'PAYMENT_OUT']).default('PAYMENT_OUT'),
    gstType: z.enum(['GST', 'NON-GST']).default('GST'),
    paymentType: z.enum(['CASH' , 'UPI' , 'CARD' , 'BANK_TRANSFER']).default('CASH'),
    party: z.union([z.string(), z.null()]).optional().default(null),
    vendor: z.union([z.string(), z.null()]).optional().default(null),
    purchaseId: z.string().optional(),
    paymentOutNumber: z.string().optional(),
    paymentOutDate: z.union([z.string(), z.date()]).default(() => new Date().toISOString()),
    date: z.union([z.string(), z.date()]).default(() => new Date().toISOString()),
    discount: DiscountSchema,
    notes: z.string().optional(),
    receivedAmount: z.number().nonnegative().default(0),
    settledAmount: z.number().nonnegative().default(0),
  })
  
export const paymentOutSchema = paymentOutBaseSchema.refine(
    (data) => {
      const hasParty = data.party && data.party.trim().length > 0;
      const hasVendor = data.vendor && data.vendor.trim().length > 0;
      return hasParty || hasVendor;
    },
    {
      message: "Either Party or Vendor is required",
      path: ["party"] // Error will show on party field
    }
  );;


export type PaymentOut = z.infer<typeof paymentOutSchema>;

export const updatePaymentOut = paymentOutBaseSchema.partial();

// Validation function with type guards
// export const validateInvoice = (data: unknown): { success: boolean; data?: Invoice; error?: string } => {
//   const result = paymentOutSchema.safeParse(data);
  
//   if (!result.success) {
//     return {
//       success: false,
//       error: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
//     };
//   }
  
//   return {
//     success: true,
//     data: result.data
//   };
// };