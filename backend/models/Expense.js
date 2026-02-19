const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  share: {
    type: Number,
    required: true,
    min: 0
  },
  paid: {
    type: Number,
    default: 0
  }
}, { _id: false });

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [participantSchema],
  splitType: {
    type: String,
    enum: ['equal', 'exact', 'percentage', 'shares'],
    default: 'equal'
  },
  category: {
    type: String,
    enum: [
      'food', 'transport', 'accommodation', 'entertainment',
      'shopping', 'utilities', 'healthcare', 'education',
      'travel', 'groceries', 'sports', 'other'
    ],
    default: 'other'
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  receiptUrl: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
expenseSchema.index({ groupId: 1, date: -1 });
expenseSchema.index({ paidBy: 1 });
expenseSchema.index({ 'participants.user': 1 });

module.exports = mongoose.model('Expense', expenseSchema);
