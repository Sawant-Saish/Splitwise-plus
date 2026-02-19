const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, currency, theme } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar, currency, theme },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Search users by email
// @route   GET /api/users/search?email=...
// @access  Private
const searchUsers = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email query required' });

    const users = await User.find({
      email: { $regex: email, $options: 'i' },
      _id: { $ne: req.user._id }
    }).select('name email avatar').limit(10);

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateProfile, searchUsers };
