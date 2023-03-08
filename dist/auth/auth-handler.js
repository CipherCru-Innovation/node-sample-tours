"use strict";
/** @format */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePassword = exports.getCurrentUser = exports.restrictTo = exports.resetPassword = exports.validateResetToken = exports.forgotPassword = exports.isLoggedIn = exports.isAuthenticated = exports.logout = exports.login = exports.signup = void 0;
const crypto = require("crypto");
const http_status_codes_1 = require("http-status-codes");
const user_1 = __importDefault(require("../models/users/user"));
const catch_async_1 = __importDefault(require("../utils/catch-async"));
const authUtils = __importStar(require("../utils/auth-utils"));
const jwtUtils = __importStar(require("../utils/jwt-utils"));
const emailUtils = __importStar(require("../utils/email-utils"));
const app_error_1 = __importDefault(require("../exceptions/app-error"));
const response_handler_1 = require("../factory/response-handler");
exports.signup = (0, catch_async_1.default)(async (req, res, next) => {
    // find if user already exists with the email then send the activation link to the user to re-activate the account. Else create a new accoun
    const user = await user_1.default.create(req.body);
    return authUtils.createAndSendToken(user, http_status_codes_1.StatusCodes.CREATED, res);
});
// TODO: limit user Login to 3 failed attempts
exports.login = (0, catch_async_1.default)(async (req, res, next) => {
    const { username, password } = req.body;
    console.info(req.body);
    // If email and password exists
    if (!username || !password) {
        return next(new app_error_1.default('Invalid credentials', http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    // check user exits and password matches
    // explicitly select password since it will not be pulled in data by default due to model constraints
    const loggedInUser = await user_1.default.findOne({ email: username }).select('+password');
    // generate Tokena and send response
    if (!loggedInUser ||
        !(await loggedInUser.matchPassword(password, loggedInUser.password)))
        return next(new app_error_1.default('Invalid credentials', http_status_codes_1.StatusCodes.BAD_REQUEST));
    return authUtils.createAndSendToken(loggedInUser, http_status_codes_1.StatusCodes.OK, res);
});
exports.logout = (0, catch_async_1.default)(async (req, res, next) => {
    authUtils.logoutUser(req, res);
});
exports.isAuthenticated = (0, catch_async_1.default)(async (req, res, next) => {
    // 1. Get the Token from Request Headers and check if it exists
    req.requestTime = new Date().getTime();
    const token = jwtUtils.getTokenFromHeader(req);
    if (!token)
        return next(new app_error_1.default('UnAuthenticated', http_status_codes_1.StatusCodes.UNAUTHORIZED));
    // verify jwt token
    // check for the token is expired or not.
    // jwt will throw JsonWebTokenError if failed to decode.
    const decodedToken = await jwtUtils.decode(token);
    // validate the token and the user credentials
    // check if the user exists for the give token.
    const loggedInUser = await user_1.default.findById(decodedToken.id);
    if (!loggedInUser)
        return next(new app_error_1.default('Invalid Credentials or user associated with the token does not exists.', http_status_codes_1.StatusCodes.UNAUTHORIZED));
    // check if password is changed after the token has been generated.
    req.user = loggedInUser;
    res.locals.user = req.user;
    return next();
});
exports.isLoggedIn = (0, catch_async_1.default)(async (req, res, next) => {
    // 1. Get the Token from Request Headers and check if it exists
    req.requestTime = new Date().getTime();
    const token = jwtUtils.getTokenFromHeader(req);
    if (token) {
        // verify jwt token
        // check for the token is expired or not.
        // jwt will throw JsonWebTokenError if failed to decode.
        const decodedToken = await jwtUtils.decode(token);
        // validate the token and the user credentials
        // check if the user exists for the give token.
        const loggedInUser = await user_1.default.findById(decodedToken.id);
        if (!loggedInUser)
            return next();
        // check if password is changed after the token has been generated.
        req.user = loggedInUser;
        res.locals.user = loggedInUser;
    }
    return next();
});
exports.forgotPassword = (0, catch_async_1.default)(async (req, res, next) => {
    const user = await user_1.default.findOne({ email: req.body.email });
    if (!user)
        return next(new app_error_1.default('User not registered with this email', http_status_codes_1.StatusCodes.NOT_FOUND));
    // User found generate password reset token
    const resetToken = user.createPasswordResetToken();
    // save the user without validating the schema again, to avoid validation failures issue.
    await user.save({ validateBeforeSave: false });
    // send email to the user for the reset token url.
    const resetTokenUrl = `${req.protocol}://${req.get('host')}/v1/auth/forgot/reset/${resetToken}`;
    const emailBody = `Forgot your password?
    // Here is your reset token url \n\n ${resetTokenUrl}`;
    try {
        const email = new emailUtils.Email();
        const options = {
            to: user.email.valueOf(),
            subject: '<BUDGET TRACKER> Reset your Password.',
            text: emailBody
        };
        await email.send(options);
        return (0, response_handler_1.sendSuccess)(res, http_status_codes_1.StatusCodes.OK, undefined, {
            message: 'An Email is successfully sent to your email address to reset your password.'
        });
    }
    catch (err) {
        console.error(err);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new app_error_1.default('Failed to send email to the user', http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR));
    }
});
exports.validateResetToken = (0, catch_async_1.default)(async (req, res, next) => { });
exports.resetPassword = (0, catch_async_1.default)(async (req, res, next) => {
    // Get User based on the reset token
    const hashedRestToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    // If token is not expired and user is valid, set the new Password
    const user = await user_1.default.findOne({
        passwordResetExpires: { $gt: Date.now() },
        passwordResetToken: hashedRestToken
    });
    if (!user && null == user) {
        next(new app_error_1.default('The reset token is invalid or Expired', http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    else {
        // Update Password Change timestamp
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordResetExpires = undefined;
        user.passwordResetToken = undefined;
        await user.save();
    }
    // Log in the user and send new JWT instead
    return authUtils.createAndSendToken(user, http_status_codes_1.StatusCodes.OK, res);
});
const restrictTo = (..._roles) => (req, res, next) => {
    // check TOken if exit or valid
    if (!_roles.includes(req.user.role))
        return next(new app_error_1.default('You do not have permission to access this resource', http_status_codes_1.StatusCodes.FORBIDDEN));
    return next();
};
exports.restrictTo = restrictTo;
const getCurrentUser = (req, res, next) => {
    req.params.id = req.user._id;
    return next();
};
exports.getCurrentUser = getCurrentUser;
exports.updatePassword = (0, catch_async_1.default)(async (req, res, next) => {
    // Get the current user
    const currentUser = await user_1.default.findById(req.user._id).select('+password');
    if (!currentUser) {
        return next(new app_error_1.default('There is no user available. Please login to perform this operation.', http_status_codes_1.StatusCodes.BAD_REQUEST));
    }
    // Check posted password is correct
    if (!(await currentUser.matchPassword(req.body.passwordCurrent, currentUser.password))) {
        return next(new app_error_1.default('UnAuthorized. Current Password is incorrect', http_status_codes_1.StatusCodes.FORBIDDEN));
    }
    // update the password
    currentUser.password = req.body.password;
    currentUser.passwordConfirm = req.body.passwordConfirm;
    await currentUser.save();
    // log the user in
    return authUtils.createAndSendToken(currentUser, http_status_codes_1.StatusCodes.OK, res, 'Password updated successfully !!');
});
