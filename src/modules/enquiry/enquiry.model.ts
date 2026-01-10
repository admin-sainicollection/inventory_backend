import mongoose, {Document, Schema} from "mongoose";

export type StatusType = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'FOLLOW_UP' |
    'CONVERTED' | 'CLOSED' | 'CANCELLED'

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'

export type Source = 'CALL' | 'WHATSAPP' | 'EMAIL' | 'WEBSITE' |
    'WALK_IN' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'OTHER'

export interface IEnquiry extends Document {
    enquiry_no: string
    enquiry_date: Date
    party_id?: mongoose.Types.ObjectId
    subject?: string
    description?: string
    assigned_employee_id?: mongoose.Types.ObjectId
    assigned_date?: Date
    status: StatusType
    closed_result?: string
    cancelled_reason?: string
    priority?: Priority
    source?: Source
    product_id?: mongoose.Types.ObjectId[]
    createdAt: Date
    updatedAt: Date
    
    // Virtuals
    party?: any
    assigned_employee?: any
    products?: any[]
    
    // Methods
    canBeConverted(): boolean
    canBeClosed(): boolean
    canBeCancelled(): boolean
}

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
    }]
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

enquirySchema.virtual('products', {
    ref: 'Product',
    localField: 'product_id',
    foreignField: '_id'
});

// Indexes
enquirySchema.index({ enquiry_date: -1 });
enquirySchema.index({ status: 1, priority: -1 });
enquirySchema.index({ party_id: 1, enquiry_date: -1 });
enquirySchema.index({ assigned_employee_id: 1, status: 1 });
enquirySchema.index({ createdAt: -1 });

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

// Pre-save middleware for auto-setting assigned_date
enquirySchema.pre('save', function(next) {
    if (this.isModified('assigned_employee_id') && this.assigned_employee_id && !this.assigned_date) {
        this.assigned_date = new Date();
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