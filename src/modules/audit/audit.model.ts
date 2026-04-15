import mongoose, { Schema, Document } from "mongoose";

export interface IAudit extends Document {
  actorId?: Schema.Types.ObjectId;
  action: string;
  targetId?: Schema.Types.ObjectId;
  meta?: any;
}

const AuditSchema = new Schema<IAudit>({
  actorId: { type: Schema.Types.ObjectId, ref: "User" },
  action: { type: String, required: true },
  targetId: { type: Schema.Types.ObjectId },
  meta: { type: Schema.Types.Mixed },
}, { timestamps: true });

export default mongoose.model<IAudit>("Audit", AuditSchema);
