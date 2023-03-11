/** @format */

import express from 'express';
import {
    signup,
    login,
    forgotPassword,
    resetPassword,
    logout
} from '../auth/auth-handler';
import userRoute from '../routes/user-route';

const router = express.Router();

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/forgotPassword').post(forgotPassword);
router.route('/reset/:token').post(resetPassword);
router.use('/profile', userRoute);

export default router;
