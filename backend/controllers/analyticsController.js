const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const Group = require('../models/Group');

// @desc    Get dashboard analytics for user
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Get all groups for user
    const groups = await Group.find({ 'members.user': userId, isArchived: false });
    const groupIds = groups.map(g => g._id);

    // All expenses involving user
    const expenses = await Expense.find({
      groupId: { $in: groupIds },
      isDeleted: false
    }).populate('groupId', 'name');

    const settlements = await Settlement.find({ groupId: { $in: groupIds } });

    // Total spent by user
    let totalSpent = 0;
    let totalOwed = 0; // others owe user
    let totalOwing = 0; // user owes others

    // Category breakdown
    const categoryMap = {};

    // Monthly summary (last 6 months)
    const monthlyMap = {};
    const now = new Date();

    expenses.forEach(expense => {
      const paidByMe = expense.paidBy.toString() === userId.toString();
      const myParticipant = expense.participants.find(p => p.user.toString() === userId.toString());

      if (paidByMe) {
        totalSpent += expense.amount;
      }

      // My share
      if (myParticipant) {
        const myShare = myParticipant.share;
        const paidAmount = paidByMe ? expense.amount : 0;
        const net = paidAmount - myShare;

        if (net > 0) totalOwed += net;
        else if (net < 0) totalOwing += Math.abs(net);

        // Category breakdown (my share)
        if (!categoryMap[expense.category]) categoryMap[expense.category] = 0;
        categoryMap[expense.category] += myShare;

        // Monthly (my share)
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { spent: 0, month: monthKey };
        if (paidByMe) monthlyMap[monthKey].spent += expense.amount;
      }
    });

    // Adjust for settlements
    settlements.forEach(s => {
      if (s.paidBy.toString() === userId.toString()) {
        totalOwing -= s.amount;
      } else if (s.paidTo.toString() === userId.toString()) {
        totalOwed -= s.amount;
      }
    });

    // Build monthly array for last 6 months
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyData.push({ month: label, spent: Math.round((monthlyMap[key]?.spent || 0) * 100) / 100 });
    }

    const categoryData = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100
    })).sort((a, b) => b.amount - a.amount);

    res.json({
      success: true,
      stats: {
        totalSpent: Math.round(totalSpent * 100) / 100,
        totalOwed: Math.max(0, Math.round(totalOwed * 100) / 100),
        totalOwing: Math.max(0, Math.round(totalOwing * 100) / 100),
        netBalance: Math.round((totalOwed - totalOwing) * 100) / 100,
        groupCount: groups.length,
        expenseCount: expenses.length
      },
      categoryData,
      monthlyData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
