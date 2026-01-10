import { IEnquiry, Priority, Source, StatusType } from "./enquiry.model";

// Types
export interface CreateEnquiryData {
    party_id?: string;
    enquiry_date?: Date | string;
    subject?: string;
    description?: string;
    assigned_employee_id?: string;
    assigned_date?: Date
    status?: StatusType;
    closed_result?: string;
    cancelled_reason?: string;
    priority?: Priority;
    source?: Source;
    product_id?: string[];
}

export interface UpdateEnquiryData {
    party_id?: string;
    enquiry_date?: Date | string;
    subject?: string;
    description?: string;
    assigned_employee_id?: string;
    assigned_date?: Date
    status?: StatusType;
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
    data: IEnquiry[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}