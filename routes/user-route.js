const express = require('express');

const { updateMe, deleteMe, getUser } = require('../controllers/user-handler');
const auth = require('../auth/auth-handler');

const router = express.Router();

router
    .route('/profile')
    .patch(auth.isAuthenticated, updateMe)
    .delete(auth.isAuthenticated, deleteMe)
    .get(auth.isAuthenticated, auth.getCurrentUser, getUser);

module.exports = router;
