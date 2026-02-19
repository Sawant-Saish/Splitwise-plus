const Group = require('../models/Group');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');

// @desc    Create group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res, next) => {
  try {
    const { name, description, icon, category, currency } = req.body;

    const group = await Group.create({
      name,
      description,
      icon: icon || '💸',
      category: category || 'other',
      currency: currency || 'USD',
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    await group.populate('members.user', 'name email avatar');

    // Notify via socket
    req.io?.emit('group-created', group);

    res.status(201).json({ success: true, group });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all groups for user
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({
      'members.user': req.user._id,
      isArchived: false
    })
      .populate('members.user', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort('-updatedAt');

    res.json({ success: true, groups });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single group
// @route   GET /api/groups/:id
// @access  Private
const getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members.user', 'name email avatar')
      .populate('createdBy', 'name email avatar');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const isMember = group.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, group });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to group
// @route   POST /api/groups/:id/members
// @access  Private
const addMember = async (req, res, next) => {
  try {
    const { email } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const admin = group.members.find(m => m.user.toString() === req.user._id.toString() && m.role === 'admin');
    if (!admin) return res.status(403).json({ success: false, message: 'Only admins can add members' });

    const newUser = await User.findOne({ email });
    if (!newUser) return res.status(404).json({ success: false, message: 'User not found with that email' });

    const alreadyMember = group.members.some(m => m.user.toString() === newUser._id.toString());
    if (alreadyMember) return res.status(400).json({ success: false, message: 'User is already a member' });

    group.members.push({ user: newUser._id, role: 'member' });
    await group.save();
    await group.populate('members.user', 'name email avatar');

    req.io?.to(`group-${group._id}`).emit('member-added', { groupId: group._id, user: newUser });

    res.json({ success: true, group });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private
const removeMember = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const admin = group.members.find(m => m.user.toString() === req.user._id.toString() && m.role === 'admin');
    if (!admin) return res.status(403).json({ success: false, message: 'Only admins can remove members' });

    group.members = group.members.filter(m => m.user.toString() !== req.params.userId);
    await group.save();
    await group.populate('members.user', 'name email avatar');

    res.json({ success: true, group });
  } catch (error) {
    next(error);
  }
};

// @desc    Get group balances with debt simplification
// @route   GET /api/groups/:id/balances
// @access  Private
const getGroupBalances = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id).populate('members.user', 'name email avatar');
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const expenses = await Expense.find({ groupId: req.params.id, isDeleted: false });
    const settlements = await Settlement.find({ groupId: req.params.id });

    // Calculate net balances
    const balances = {};
    group.members.forEach(m => {
      balances[m.user._id.toString()] = 0;
    });

    // Process expenses
    expenses.forEach(expense => {
      const paidById = expense.paidBy.toString();
      if (balances[paidById] !== undefined) {
        balances[paidById] += expense.amount;
      }
      expense.participants.forEach(p => {
        const userId = p.user.toString();
        if (balances[userId] !== undefined) {
          balances[userId] -= p.share;
        }
      });
    });

    // Process settlements
    settlements.forEach(s => {
      const fromId = s.paidBy.toString();
      const toId = s.paidTo.toString();
      if (balances[fromId] !== undefined) balances[fromId] += s.amount;
      if (balances[toId] !== undefined) balances[toId] -= s.amount;
    });

    // Simplify debts
    const simplifiedDebts = simplifyDebts(balances, group.members);

    // Member balances array
    const memberBalances = group.members.map(m => ({
      user: m.user,
      balance: Math.round(balances[m.user._id.toString()] * 100) / 100
    }));

    res.json({ success: true, memberBalances, simplifiedDebts });
  } catch (error) {
    next(error);
  }
};

/**
 * Debt Simplification Algorithm
 * Minimizes the number of transactions needed to settle all debts
 */
const simplifyDebts = (balances, members) => {
  const memberMap = {};
  members.forEach(m => {
    memberMap[m.user._id.toString()] = m.user;
  });

  const debtors = []; // owe money (negative balance)
  const creditors = []; // are owed money (positive balance)

  Object.entries(balances).forEach(([userId, balance]) => {
    const rounded = Math.round(balance * 100) / 100;
    if (rounded < -0.01) debtors.push({ userId, amount: Math.abs(rounded) });
    if (rounded > 0.01) creditors.push({ userId, amount: rounded });
  });

  const transactions = [];

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);

    transactions.push({
      from: memberMap[debtor.userId],
      to: memberMap[creditor.userId],
      amount: Math.round(amount * 100) / 100
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return transactions;
};

// @desc    Delete / archive group
// @route   DELETE /api/groups/:id
// @access  Private
const deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only creator can delete group' });
    }

    group.isArchived = true;
    await group.save();

    res.json({ success: true, message: 'Group archived successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createGroup, getGroups, getGroup, addMember, removeMember, getGroupBalances, deleteGroup };
