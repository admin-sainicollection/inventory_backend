import mongoose from "mongoose";
import {  IStatusHistory, IStatusNote, Priority, Source, StatusType } from "./enquiry.model";

export interface CreateEnquiryData {
    enquiry_date?: Date;
    party_id?: string;
    subject: string;
    description: string;
    assigned_employee_id?: string;
    assigned_date?: Date;
    status?: StatusType;
    status_note?: string;
    closed_result?: string;
    cancelled_reason?: string;
    priority?: Priority;
    source?: Source;
    product_id?: string[];
}

export interface UpdateEnquiryData {
    enquiry_date?: Date;
    party_id?: string;
    subject?: string;
    description?: string;
    assigned_employee_id?: string;
    assigned_date?: Date;
    status?: StatusType;
    status_note?: string;
    status_changed_by?: mongoose.Types.ObjectId;
    status_changed_at?: Date;
    closed_result?: string;
    cancelled_reason?: string;
    priority?: Priority;
    source?: Source;
    product_id?: string[];
}

export interface FilterOptions {
    search?: string | undefined;
    status?: StatusType | undefined;
    priority?: Priority | undefined;
    source?: Source | undefined;
    party_id?: string | undefined;
    assigned_employee_id?: string | undefined;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    page?: number | undefined;
    limit?: number | undefined;
}

export interface PaginatedResult {
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface EnquiryWithHistory {
    enquiry: any;
    status_history: IStatusHistory[];
    status_notes: IStatusNote[];
}