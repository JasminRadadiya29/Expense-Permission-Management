import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'RESUBMIT', 'LOGOUT', 'LOGIN', 'PASSWORD_CHANGE'],
    required: true,
  },
  resourceType: {
    type: String,
    enum: ['Expense', 'Approval', 'ApprovalRule', 'User'],
    required: true,
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
