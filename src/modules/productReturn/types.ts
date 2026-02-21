import mongoose, { Document } from "mongoose";

export type Status = 'RETURN_CREATED' | 'AWAITING_RECEIPT' | 'RECEIVED_AT_SHOP' | 'INSPECTED' | 'SENT_TO_VENDOR' | 'RECEIVED_BY_VENDOR' | 'RESOLVED' | 'CLOSED'

export interface Item {
    id?: string;
    srNo?: number;
    itemName?: string;
    aliasName?: string;
    hsnNo?: string;
    quantity?: number;
    price?: number;
    amount?: number;
    productId?: string;
}

export interface IStatusNote  {
    previous_status?: string | undefined;
    current_status: string | undefined;
    note: string | undefined;
    created_at: Date;
}

export interface IStatusActivity  {
    from_status?: Status
    to_status: Status
    note?: string;
    changed_at: Date;
    is_initial?: boolean;
}

export interface CreateProductReurn  {
    returnNumber?: string,
    returnDate?: string | Date,
    items?: Item[],
    in_date?: string | Date,
    out_date?: string | Date,
    party?: mongoose.Types.ObjectId,
    vendor?: mongoose.Types.ObjectId,
    description?: string,
    status?: Status,
    previous_status?: string,
    status_note?: string
}

export interface IProductReturn extends CreateProductReurn{
    status_history:IStatusActivity[],
    status_notes:IStatusNote[]
}