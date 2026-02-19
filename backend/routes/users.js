const express = require('express');
const { updateProfile, searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.put('/profile', updateProfile);
router.get('/search', searchUsers);

module.exports = router;
