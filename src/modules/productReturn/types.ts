import mongoose from "mongoose";

export type Status = 'RETURN_CREATED' | 'RECEIVED_AT_SHOP'| 'SENT_TO_VENDOR' | 'RECEIVED_BY_VENDOR' 

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
    from_status?: Status | undefined
    to_status: Status
    note?: string | undefined;
    changed_at: Date;
    is_initial?: boolean | undefined;
}

export interface CreateProductReurn  {
    productReturnNumber?: string,
    productReturnDate?: string | Date,
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
    status_history?:IStatusActivity[],
    status_notes?:IStatusNote[]
}

export interface FilterOptions {
    search?: string;
    status?: string;
    dateRange?: string;
    startDate?: string | Date;
    endDate?: string | Date;
    page?: number;
    limit?: number;
    partyId?: string;
    vendorId?: string;
}