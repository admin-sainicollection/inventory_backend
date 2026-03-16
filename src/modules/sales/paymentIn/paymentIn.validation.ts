import z from "zod";

const DiscountSchema = z.object({
  type: z.enum(['before_tax', 'after_tax']).default('before_tax'),
  amount: z.number().nonnegative().default(0),
  isPercentage: z.boolean().default(false)
}).nullable().default(null);

// Single schema with conditional validation
export const paymentInSchema = z.object({
  paymentInType: z.enum(['INVOICE', 'QUOTATION', 'SALES_RETURN', 'CREDIT_NOTE', 'DEBIT_NOTE', 'PURCHASE_ORDER','PAYMENT_IN']).default('PAYMENT_IN'),
  gstType: z.enum(['GST', 'NON-GST']).default('GST'),
  paymentType: z.enum(['CASH' , 'UPI' , 'CARD' , 'BANK_TRANSFER']).default('CASH'),
  party: z.string().min(1,'Please select party first '),
  invoiceId: z.string().optional(),
  paymentInNumber: z.string().optional(),
  paymentInDate: z.union([z.string(), z.date()]).default(() => new Date().toISOString()),
  date: z.union([z.string(), z.date()]).default(() => new Date().toISOString()),
  discount: DiscountSchema,
  notes: z.string().optional(),
  receivedAmount: z.number().nonnegative().default(0),
  settledAmount: z.number().nonnegative().default(0),
})


export type PaymentIn = z.infer<typeof paymentInSchema>;

export const updatePaymentIn = paymentInSchema.partial();

// Validation function with type guards
// export const validateInvoice = (data: unknown): { success: boolean; data?: Invoice; error?: string } => {
//   const result = paymentInSchema.safeParse(data);
  
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