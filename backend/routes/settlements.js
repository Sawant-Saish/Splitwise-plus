const express = require('express');
const { body } = require('express-validator');
const { createSettlement, getGroupSettlements, deleteSettlement } = require('../controllers/settlementController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(
    [
      body('groupId').notEmpty().withMessage('Group is required'),
      body('paidTo').notEmpty().withMessage('Recipient is required'),
      body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive')
    ],
    validate,
    createSettlement
  );

router.get('/group/:groupId', getGroupSettlements);
router.delete('/:id', deleteSettlement);

module.exports = router;
