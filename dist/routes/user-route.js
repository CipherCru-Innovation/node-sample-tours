"use strict";
/** @format */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const { updateMe, deleteMe, getUser, uploadUserPhoto, resizeUserPhoto } = require('../controllers/user-handler');
const auth = require('../auth/auth-handler');
const router = express.Router();
router
    .route('/')
    .patch(auth.isAuthenticated, auth.getCurrentUser, uploadUserPhoto, resizeUserPhoto, updateMe)
    .delete(auth.isAuthenticated, deleteMe)
    .get(auth.isAuthenticated, auth.getCurrentUser, getUser);
router
    .route('/update-password')
    .patch(auth.isAuthenticated, auth.getCurrentUser, auth.updatePassword);
exports.default = router;
