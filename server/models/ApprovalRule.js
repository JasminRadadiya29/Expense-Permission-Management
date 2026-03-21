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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('ApprovalRule', approvalRuleSchema);