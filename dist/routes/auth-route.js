"use strict";
/** @format */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_handler_1 = require("../auth/auth-handler");
const userRoute = require('./user-route');
const router = express_1.default.Router();
router.route('/signup').post(auth_handler_1.signup);
router.route('/login').post(auth_handler_1.login);
router.route('/logout').get(auth_handler_1.logout);
router.route('/forgotPassword').post(auth_handler_1.forgotPassword);
router.route('/reset/:token').post(auth_handler_1.resetPassword);
router.use('/profile', userRoute);
exports.default = router;
