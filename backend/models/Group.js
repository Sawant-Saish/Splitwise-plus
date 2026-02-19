const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    maxlength: [100, 'Group name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  icon: {
    type: String,
    default: '💸'
  },
  category: {
    type: String,
    enum: ['trip', 'home', 'couple', 'friends', 'work', 'other'],
    default: 'other'
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  coverImage: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: total expense count
groupSchema.virtual('expenseCount', {
  ref: 'Expense',
  localField: '_id',
  foreignField: 'groupId',
  count: true
});

module.exports = mongoose.model('Group', groupSchema);
