import z from "zod";

// Common schemas
const ProductItemSchema = z.object({
  id: z.string(),
  srNo: z.number().int().positive(),
  itemName: z.string().min(1),
  hsnNo: z.string().optional(),
  quantity: z.number().positive(),
  price: z.number().nonnegative(),
  discount: z.object({
    amount: z.number().nonnegative().default(0),
    isPercentage: z.boolean().default(false)
  }).default({ amount: 0, isPercentage: false }),
  tax: z.object({
    type: z.enum(['none', 'gst', 'custom']).default('none'),
    rate: z.number().min(0).max(100).default(0)
  }).default({ type: 'none', rate: 0 }),
  amount: z.number().nonnegative(),
  productId: z.string().optional()
});

const AdditionalChargeSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  amount: z.number().nonnegative()
});

const DiscountSchema = z.object({
  type: z.enum(['before_tax', 'after_tax']).default('before_tax'),
  amount: z.number().nonnegative().default(0),
  isPercentage: z.boolean().default(false)
}).nullable().default(null);

const TaxBreakdownItemSchema = z.object({
  sgst: z.number().min(0).max(100).default(0),
  cgst: z.number().min(0).max(100).default(0),
  igst: z.number().min(0).max(100).default(0)
});

// Single schema with conditional validation
export const CreditNoteSchema = z.object({
  creditNoteType: z.enum(['INVOICE', 'QUOTATION', 'SALES_RETURN', 'CREDIT_NOTE', 'DEBIT_NOTE', 'PURCHASE_ORDER']).default('CREDIT_NOTE'),
  gstType: z.enum(['GST', 'NON-GST']).default('GST'),
  paymentType: z.enum(['CASH' , 'UPI' , 'CARD' , 'BANK_TRANSFER']).default('CASH'),
  party: z.string().optional(),
  invoiceId: z.string().optional(),
  creditNoteNumber: z.string().optional(),
  creditNoteDate: z.union([z.string(), z.date()]).default(() => new Date().toISOString()),
  date: z.union([z.string(), z.date()]).default(() => new Date().toISOString()),
  dueDate: z.union([z.string(), z.date()]).optional(),
  items: z.array(ProductItemSchema).min(1),
  charges: z.array(AdditionalChargeSchema).default([]),
  discount: DiscountSchema,
  notes: z.string().optional(),
  terms: z.string().optional(),
  paymentTerms: z.string().optional(),
  roundOff: z.boolean().default(false),
  totalAmount: z.number().nonnegative().default(0),
  taxableAmount: z.number().nonnegative().default(0),
  subtotal: z.number().nonnegative().default(0),
  receivedAmount: z.number().nonnegative().default(0),
  balanceAmount: z.number().nonnegative().default(0),
  taxBreakdown: z.array(TaxBreakdownItemSchema).default([])
})
.refine((data) => {
  // HSN validation based on GST type
  if (data.gstType === 'GST') {
    return data.items.every(item => item.hsnNo && item.hsnNo.trim().length > 0);
  }
  return true;
}, {
  message: "HSN code is required for all items in GST invoices",
  path: ["items"]
})
.refine((data) => {
  // Tax validation based on GST type
  if (data.gstType === 'NON-GST') {
    return data.items.every(item => item.tax.type === 'none' && item.tax.rate === 0);
  }
  return true;
}, {
  message: "Tax should be 'none' with 0% rate for NON-GST invoices",
  path: ["items"]
})
.refine((data) => {
  // Tax breakdown validation
  if (data.gstType === 'NON-GST') {
    return data.taxBreakdown.length === 0 || 
           data.taxBreakdown.every(item => item.sgst === 0 && item.cgst === 0 && item.igst === 0);
  }
  return true;
}, {
  message: "Tax breakdown should not contain tax values for NON-GST invoices",
  path: ["taxBreakdown"]
});

export type CreditNote = z.infer<typeof CreditNoteSchema>;

export const updateCreditNote = CreditNoteSchema.partial();

// Validation function with type guards
// export const validateInvoice = (data: unknown): { success: boolean; data?: Invoice; error?: string } => {
//   const result = CreditNoteSchema.safeParse(data);
  
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