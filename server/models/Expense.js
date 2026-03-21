import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Travel', 'Food', 'Office Supplies', 'Software', 'Hardware', 'Marketing', 'Other']
  },
  date: {
    type: Date,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true
  },
  amountInBaseCurrency: {
    type: Number,
    required: true
  },
  paidBy: {
    type: String,
    required: true,
    enum: ['Company', 'Personal']
  },
  remarks: {
    type: String,
    default: ''
  },
  receiptUrl: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['Draft', 'Waiting Approval', 'Approved', 'Rejected'],
    default: 'Draft'
  },
  currentApprovalStep: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

expenseSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Expense', expenseSchema);