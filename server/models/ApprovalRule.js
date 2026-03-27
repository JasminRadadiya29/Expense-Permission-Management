import mongoose from 'mongoose';

const approvalRuleSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  steps: [{
    stepNumber: {
      type: Number,
      required: true
    },
    approvers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    approvalType: {
      type: String,
      enum: ['all', 'percentage', 'specific', 'hybrid'],
      default: 'all'
    },
    requiredPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 100
    },
    specificApprovers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1
  },
  versionHistory: [{
    version: Number,
    steps: mongoose.Schema.Types.Mixed,
    updatedAt: Date,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const ApprovalRule = mongoose.models.ApprovalRule || mongoose.model('ApprovalRule', approvalRuleSchema);

export default ApprovalRule;