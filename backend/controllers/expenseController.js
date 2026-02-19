const Expense = require('../models/Expense');
const Group = require('../models/Group');

// @desc    Add expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res, next) => {
  try {
    const { title, amount, paidBy, participants, splitType, category, groupId, notes, receiptUrl, date, currency } = req.body;

    // Verify group membership
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });

    // Calculate shares based on split type
    let calculatedParticipants = participants;

    if (splitType === 'equal') {
      const share = parseFloat((amount / participants.length).toFixed(2));
      const remainder = parseFloat((amount - share * participants.length).toFixed(2));
      calculatedParticipants = participants.map((p, idx) => ({
        user: p.user,
        share: idx === 0 ? share + remainder : share,
        paid: p.user === (paidBy || req.user._id.toString()) ? amount : 0
      }));
    }

    const expense = await Expense.create({
      title,
      amount,
      currency: currency || group.currency,
      paidBy: paidBy || req.user._id,
      participants: calculatedParticipants,
      splitType,
      category,
      groupId,
      notes,
      receiptUrl,
      date: date || new Date(),
      createdBy: req.user._id
    });

    await expense.populate([
      { path: 'paidBy', select: 'name email avatar' },
      { path: 'participants.user', select: 'name email avatar' },
      { path: 'createdBy', select: 'name email avatar' }
    ]);

    // Real-time update
    req.io?.to(`group-${groupId}`).emit('expense-added', expense);

    res.status(201).json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Get expenses for a group
// @route   GET /api/expenses/group/:groupId
// @access  Private
const getGroupExpenses = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, startDate, endDate } = req.query;

    const filter = { groupId: req.params.groupId, isDeleted: false };
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(filter)
      .populate('paidBy', 'name email avatar')
      .populate('participants.user', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort('-date')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Expense.countDocuments(filter);

    res.json({
      success: true,
      expenses,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense
// @route   GET /api/expenses/:id
// @access  Private
const getExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('paidBy', 'name email avatar')
      .populate('participants.user', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!expense || expense.isDeleted) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    res.json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findById(req.params.id);
    if (!expense || expense.isDeleted) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    if (expense.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only creator can edit expense' });
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('paidBy', 'name email avatar')
      .populate('participants.user', 'name email avatar');

    req.io?.to(`group-${expense.groupId}`).emit('expense-updated', expense);

    res.json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense (soft delete)
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense || expense.isDeleted) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    if (expense.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only creator can delete expense' });
    }

    expense.isDeleted = true;
    await expense.save();

    req.io?.to(`group-${expense.groupId}`).emit('expense-deleted', { id: expense._id });

    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's personal expenses across all groups
// @route   GET /api/expenses/my
// @access  Private
const getMyExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({
      'participants.user': req.user._id,
      isDeleted: false
    })
      .populate('paidBy', 'name email avatar')
      .populate('participants.user', 'name email avatar')
      .populate('groupId', 'name icon')
      .sort('-date')
      .limit(50);

    res.json({ success: true, expenses });
  } catch (error) {
    next(error);
  }
};

module.exports = { addExpense, getGroupExpenses, getExpense, updateExpense, deleteExpense, getMyExpenses };
