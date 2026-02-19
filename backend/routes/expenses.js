const express = require('express');
const { body } = require('express-validator');
const {
  addExpense, getGroupExpenses, getExpense, updateExpense, deleteExpense, getMyExpenses
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.get('/my', getMyExpenses);
router.get('/group/:groupId', getGroupExpenses);

router.route('/')
  .post(
    [
      body('title').trim().notEmpty().withMessage('Title is required'),
      body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
      body('groupId').notEmpty().withMessage('Group is required'),
      body('participants').isArray({ min: 1 }).withMessage('At least one participant required')
    ],
    validate,
    addExpense
  );

router.route('/:id')
  .get(getExpense)
  .put(updateExpense)
  .delete(deleteExpense);

module.exports = router;
