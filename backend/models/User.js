const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: function() {
      // Generate a consistent color-based avatar URL
      const colors = ['4f46e5','7c3aed','db2777','dc2626','ea580c','ca8a04','16a34a','0891b2'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=${color}&color=fff&bold=true`;
    }
  },
  currency: {
    type: String,
    default: 'USD'
  },
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'dark'
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Auto-set avatar if name is provided
userSchema.pre('save', function(next) {
  if (this.isNew && !this.avatar) {
    const colors = ['4f46e5','7c3aed','db2777','dc2626','ea580c','ca8a04','16a34a','0891b2'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    this.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=${color}&color=fff&bold=true`;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
