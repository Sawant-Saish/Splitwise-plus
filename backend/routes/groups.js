const express = require('express');
const { body } = require('express-validator');
const {
  createGroup, getGroups, getGroup, addMember, removeMember, getGroupBalances, deleteGroup
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getGroups)
  .post(
    [body('name').trim().notEmpty().withMessage('Group name is required')],
    validate,
    createGroup
  );

router.route('/:id')
  .get(getGroup)
  .delete(deleteGroup);

router.get('/:id/balances', getGroupBalances);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
