import { z } from 'zod';

export const RETURN_STATUS = [
  'RETURN_CREATED',
  'AWAITING_RECEIPT',
  'RECEIVED_AT_SHOP',
  'INSPECTED',
  'SENT_TO_VENDOR',
  'RECEIVED_BY_VENDOR',
  'RESOLVED',
  'CLOSED'
] as const;

// Item Schema
export const itemSchema = z.object({
  id: z.string().optional(),
  srNo: z.number().optional(),
  itemName: z.string().optional(),
  aliasName: z.string().optional(),
  hsnNo: z.string().optional(),
  quantity: z.number().optional(),
  price: z.number().optional(),
  amount: z.number().optional(),
  productId: z.string().optional(),
});

// Status Activity Schema
export const statusActivitySchema = z.object({
  from_status: z.enum(RETURN_STATUS).optional(),
  to_status: z.enum(RETURN_STATUS),
  note: z.string().trim().optional(),
  changed_at: z.date().default(() => new Date()),
  is_initial: z.boolean().default(false).optional(),
});

// Status Note Schema
export const statusNoteSchema = z.object({
  previous_status: z.enum(RETURN_STATUS).optional(),
  current_status: z.enum(RETURN_STATUS).optional(),
  note: z.string().trim().min(1, 'Note is required'),
  created_at: z.date().default(() => new Date()),
});

// Create Product Return Schema (for input)
export const baseCreateProductReturnSchema = z.object({
  productReturnNumber: z.string().trim().optional(),
  productReturnDate: z.union([z.string(), z.date()])
    .transform(val => new Date(val))
    .default(() => new Date()),
  items: z.array(itemSchema).optional(),
  in_date: z.union([z.string(), z.date()])
    .transform(val => new Date(val))
    .optional(),
  out_date: z.union([z.string(), z.date()])
    .transform(val => new Date(val))
    .optional(),
  party: z.string().optional(),
  vendor: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(RETURN_STATUS).default('RETURN_CREATED'),
  previous_status: z.string().optional(),
  status_note: z.string().optional(),
});

// Full Product Return Schema (including history and notes)
export const productReturnSchema = baseCreateProductReturnSchema.extend({
  status_history: z.array(statusActivitySchema).optional(),
  status_notes: z.array(statusNoteSchema).optional(),
});

export const updateProductReturnSchema = baseCreateProductReturnSchema.partial();