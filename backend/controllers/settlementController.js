const Settlement = require('../models/Settlement');
const Group = require('../models/Group');

// @desc    Record a settlement payment
// @route   POST /api/settlements
// @access  Private
const createSettlement = async (req, res, next) => {
  try {
    const { groupId, paidTo, amount, notes, date, currency } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });

    const settlement = await Settlement.create({
      groupId,
      paidBy: req.user._id,
      paidTo,
      amount,
      currency: currency || group.currency,
      notes,
      date: date || new Date(),
      createdBy: req.user._id
    });

    await settlement.populate([
      { path: 'paidBy', select: 'name email avatar' },
      { path: 'paidTo', select: 'name email avatar' }
    ]);

    req.io?.to(`group-${groupId}`).emit('settlement-created', settlement);

    res.status(201).json({ success: true, settlement });
  } catch (error) {
    next(error);
  }
};

// @desc    Get settlements for group
// @route   GET /api/settlements/group/:groupId
// @access  Private
const getGroupSettlements = async (req, res, next) => {
  try {
    const settlements = await Settlement.find({ groupId: req.params.groupId })
      .populate('paidBy', 'name email avatar')
      .populate('paidTo', 'name email avatar')
      .sort('-date');

    res.json({ success: true, settlements });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete settlement
// @route   DELETE /api/settlements/:id
// @access  Private
const deleteSettlement = async (req, res, next) => {
  try {
    const settlement = await Settlement.findById(req.params.id);
    if (!settlement) return res.status(404).json({ success: false, message: 'Settlement not found' });

    if (settlement.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await settlement.deleteOne();
    res.json({ success: true, message: 'Settlement deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createSettlement, getGroupSettlements, deleteSettlement };
