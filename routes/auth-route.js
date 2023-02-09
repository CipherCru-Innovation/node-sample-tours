const express = require('express');
const { signup, login, forgotPassword, resetPassword } = require('../auth/auth-handler');
const userRoute = require('./user-route');

const router = express.Router();

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/forgotPassword').post(forgotPassword);
router.route('/reset/:token').post(resetPassword);
router.use('/user', userRoute);

module.exports = router;
