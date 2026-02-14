import mongoose, { Document, Schema } from "mongoose";

export type StatusType = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'FOLLOW_UP' |
    'CONVERTED' | 'CLOSED' | 'CANCELLED'

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'

export type Source = 'CALL' | 'WHATSAPP' | 'EMAIL' | 'WEBSITE' |
    'WALK_IN' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'OTHER'

export interface IStatusHistory {
    from_status?: StatusType | undefined;
    to_status: StatusType;
    note?: string | undefined;
    changed_by?: mongoose.Types.ObjectId | undefined;
    changed_at: Date;
    is_initial?: boolean | undefined;
}

export interface IStatusNote {
    previous_status?: StatusType | undefined;
    current_status: StatusType;
    note: string;
    created_by?: mongoose.Types.ObjectId | undefined;
    created_at: Date;
}

export interface IEnquiry extends Document {
    enquiry_no: string
    enquiry_date: Date
    party_id?: mongoose.Types.ObjectId
    subject?: string
    description?: string
    assigned_employee_id?: mongoose.Types.ObjectId
    assigned_date?: Date
    
    // Current status fields
    status: StatusType
    status_note?: string
    status_changed_by?: mongoose.Types.ObjectId
    status_changed_at?: Date
    originalStatus?: StatusType | undefined
    
    closed_result?: string
    cancelled_reason?: string
    priority?: Priority
    source?: Source
    product_id?: mongoose.Types.ObjectId[]
    
    // Status History and Tracking
    status_history: IStatusHistory[]
    status_notes: IStatusNote[]
    
    createdAt: Date
    updatedAt: Date
    
    // Virtuals
    party?: any
    assigned_employee?: any
    products?: any[]
    status_changed_by_employee?: any
    
    // Methods
    canBeConverted(): boolean
    canBeClosed(): boolean
    canBeCancelled(): boolean
}

// Sub-schemas
const statusHistorySchema = new Schema<IStatusHistory>({
    from_status: {
        type: String,
        enum: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'FOLLOW_UP', 'CONVERTED', 'CLOSED', 'CANCELLED']
    },
    to_status: {
        type: String,
        enum: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'FOLLOW_UP', 'CONVERTED', 'CLOSED', 'CANCELLED'],
        required: true
    },
    note: {
        type: String,
        trim: true
    },
    changed_by: {
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    },
    changed_at: {
        type: Date,
        default: Date.now
    },
    is_initial: {
        type: Boolean,
        default: false
    }
}, { _id: true });

const statusNoteSchema = new Schema<IStatusNote>({
    previous_status: {
        type: String,
        enum: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'FOLLOW_UP', 'CONVERTED', 'CLOSED', 'CANCELLED']
    },
    current_status: {
        type: String,
        enum: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'FOLLOW_UP', 'CONVERTED', 'CLOSED', 'CANCELLED'],
        required: true
    },
    note: {
        type: String,
        required: true,
        trim: true
    },
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    },
    created_at: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

export const enquirySchema = new Schema<IEnquiry>({
    enquiry_no: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
        uppercase: true,
    },
    enquiry_date: {
        type: Date,
        required: true,
        default: Date.now
    },
    party_id: {
        type: Schema.Types.ObjectId,
        ref: 'Party',
        index: true
    },
    subject: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    assigned_employee_id: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        index: true
    },
    assigned_date: {
        type: Date
    },
    status: {
        type: String,
        enum: ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'FOLLOW_UP', 'CONVERTED', 'CLOSED', 'CANCELLED'],
        default: 'NEW',
        index: true
    },
    status_note: {
        type: String,
        trim: true
    },
    status_changed_by: {
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    },
    status_changed_at: {
        type: Date
    },
    closed_result: {
        type: String,
        trim: true,
    },
    cancelled_reason: {
        type: String,
        trim: true,
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM',
        index: true
    },
    source: {
        type: String,
        enum: ['CALL', 'WHATSAPP', 'EMAIL', 'WEBSITE', 'WALK_IN', 'REFERRAL', 'SOCIAL_MEDIA', 'OTHER'],
        default: 'OTHER',
        index: true
    },
    product_id: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    
    // Status History and Tracking
    status_history: [statusHistorySchema],
    status_notes: [statusNoteSchema]
    
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtuals
enquirySchema.virtual('party', {
    ref: 'Party',
    localField: 'party_id',
    foreignField: '_id',
    justOne: true
});

enquirySchema.virtual('assigned_employee', {
    ref: 'Employee',
    localField: 'assigned_employee_id',
    foreignField: '_id',
    justOne: true
});

enquirySchema.virtual('status_changed_by_employee', {
    ref: 'Employee',
    localField: 'status_changed_by',
    foreignField: '_id',
    justOne: true
});

enquirySchema.virtual('products', {
    ref: 'Product',
    localField: 'product_id',
    foreignField: '_id'
});

// Indexes
enquirySchema.index({ enquiry_date: -1 });
enquirySchema.index({  priority: -1 });
enquirySchema.index({ party_id: 1, enquiry_date: -1 });
enquirySchema.index({ assigned_employee_id: 1});
enquirySchema.index({ createdAt: -1 });
enquirySchema.index({ 'status_history.changed_at': -1 });

// Pre-save middleware for auto-generating enquiry number
enquirySchema.pre('save', async function(next) {
    if (!this.isNew || this.enquiry_no) {
        return next();
    }

    try {
        const EnquiryModel = this.constructor as any;
        const lastEnquiry = await EnquiryModel.findOne({}, {}, { sort: { 'enquiry_no': -1 } });
        
        let nextNumber = 1;
        if (lastEnquiry && lastEnquiry.enquiry_no) {
            const match = lastEnquiry.enquiry_no.match(/ENQ-(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }

        this.enquiry_no = `ENQ-${nextNumber.toString().padStart(6, '0')}`;
        next();
    } catch (error: any) {
        next(error);
    }
});

// Pre-save middleware for status tracking and auto-setting assigned_date
enquirySchema.pre('save', function(next) {
    const enquiry = this;
    
    // Track status changes
    if (enquiry.isModified('status')) {
        const now = new Date();
        
        // Add to status history
        const statusEntry: IStatusHistory = {
            from_status: enquiry.originalStatus || undefined,
            to_status: enquiry.status,
            note: enquiry.status_note,
            changed_by: enquiry.status_changed_by,
            changed_at: now,
            is_initial: enquiry.isNew && enquiry.status === 'NEW'
        };
        
        // If this is a new enquiry, initialize the arrays
        if (enquiry.isNew) {
            enquiry.status_history = [statusEntry];
            if (enquiry.status_note) {
                enquiry.status_notes = [{
                    previous_status: undefined,
                    current_status: enquiry.status,
                    note: enquiry.status_note,
                    created_by: enquiry.status_changed_by,
                    created_at: now
                }];
            }
        } else {
            // Add to existing history
            if (!enquiry.status_history) {
                enquiry.status_history = [];
            }
            enquiry.status_history.push(statusEntry);
            
            // Add to status notes if note exists
            if (enquiry.status_note) {
                if (!enquiry.status_notes) {
                    enquiry.status_notes = [];
                }
                enquiry.status_notes.push({
                    previous_status: enquiry.originalStatus,
                    current_status: enquiry.status,
                    note: enquiry.status_note,
                    created_by: enquiry.status_changed_by,
                    created_at: now
                });
            }
        }
        
        // Update status tracking fields
        enquiry.status_changed_at = now;
        if (!enquiry.status_changed_by) {
            // Default to assigned employee if available
            if (enquiry.assigned_employee_id) {
                enquiry.status_changed_by = enquiry.assigned_employee_id;
            }
        }
    }
    
    // Auto-set assigned_date
    if (enquiry.isModified('assigned_employee_id') && enquiry.assigned_employee_id && !enquiry.assigned_date) {
        enquiry.assigned_date = new Date();
        
        // If status is not set and employee is assigned, set to ASSIGNED
        if (!enquiry.status) {
            enquiry.status = 'ASSIGNED';
        }
    }
    
    next();
});

// Store original status for tracking
enquirySchema.pre('save', function(next) {
    if (this.isModified('status')) {
        this.originalStatus = this.status;
    }
    next();
});

// Instance methods
enquirySchema.methods.canBeConverted = function(): boolean {
    return ['IN_PROGRESS', 'FOLLOW_UP', 'ASSIGNED'].includes(this.status);
};

enquirySchema.methods.canBeClosed = function(): boolean {
    return this.status !== 'CLOSED' && this.status !== 'CANCELLED' && this.status !== 'CONVERTED';
};

enquirySchema.methods.canBeCancelled = function(): boolean {
    return this.status !== 'CANCELLED' && this.status !== 'CLOSED' && this.status !== 'CONVERTED';
};

// Static methods
enquirySchema.statics.findByStatus = function(status: StatusType) {
    return this.find({ status });
};

enquirySchema.statics.findByPriority = function(priority: Priority) {
    return this.find({ priority });
};

enquirySchema.statics.findByEmployee = function(employeeId: mongoose.Types.ObjectId) {
    return this.find({ assigned_employee_id: employeeId });
};

enquirySchema.statics.findByParty = function(partyId: mongoose.Types.ObjectId) {
    return this.find({ party_id: partyId });
};

interface EnquiryModel extends mongoose.Model<IEnquiry> {
    findByStatus(status: StatusType): Promise<IEnquiry[]>;
    findByPriority(priority: Priority): Promise<IEnquiry[]>;
    findByEmployee(employeeId: mongoose.Types.ObjectId): Promise<IEnquiry[]>;
    findByParty(partyId: mongoose.Types.ObjectId): Promise<IEnquiry[]>;
}

export const Enquiry = mongoose.model<IEnquiry, EnquiryModel>('Enquiry', enquirySchema);