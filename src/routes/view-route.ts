/** @format */

import express from 'express';
import * as viewHandler from '../controllers/views-handler';
import * as authHandler from '../auth/auth-handler';

const router = express.Router();

router.get('/', authHandler.isLoggedIn, viewHandler.getOverview);
router.get('/tour/:slug', authHandler.isLoggedIn, viewHandler.getTour);
router.get('/login', authHandler.isLoggedIn, viewHandler.getLoginForm);
router.get('/signup', authHandler.isLoggedIn, viewHandler.getSignUpFrom);
router.get('/profile', authHandler.isAuthenticated, viewHandler.getProfile);

export default router;
