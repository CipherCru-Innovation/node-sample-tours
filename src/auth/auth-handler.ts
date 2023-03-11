/** @format */

import crypto = require('crypto');
import { StatusCodes } from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';
import User, { UserDocument } from '../models/users/user';

import catchAsync from '../utils/catch-async';
import * as authUtils from '../utils/auth-utils';
import * as jwtUtils from '../utils/jwt-utils';
import * as emailUtils from '../utils/email-utils';
import AppError from '../exceptions/app-error';
import { sendSuccess } from '../factory/response-handler';
import {
    AppRequest,
    ForgotPasswordRequest,
    LoginRequest,
    UpdatePasswordRequest
} from '../models/http/request.model';

export const signup = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        // find if user already exists with the email then send the activation link to the user to re-activate the account. Else create a new accoun
        const user = await User.create(req.body);

        return authUtils.createAndSendToken(user, StatusCodes.CREATED, res);
    }
);

// TODO: limit user Login to 3 failed attempts
export const login = catchAsync(
    async (req: LoginRequest, res: Response, next: NextFunction) => {
        const { username, password, email } = req.body;

        // If email and password exists
        if (!username || !password || !email) {
            return next(
                new AppError('Invalid credentials', StatusCodes.BAD_REQUEST)
            );
        }

        // check user exits and password matches
        // explicitly select password since it will not be pulled in data by default due to model constraints
        const loggedInUser = await User.findOne({ email: username }).select(
            '+password'
        );

        // generate Token and send response
        if (
            !loggedInUser ||
            !(await loggedInUser.matchPassword(password, loggedInUser.password))
        )
            return next(
                new AppError('Invalid credentials', StatusCodes.BAD_REQUEST)
            );

        return authUtils.createAndSendToken(loggedInUser, StatusCodes.OK, res);
    }
);

export const logout = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        authUtils.logoutUser(req, res);
    }
);

export const isAuthenticated = catchAsync(
    async (req: AppRequest, res: Response, next: NextFunction) => {
        // 1. Get the Token from Request Headers and check if it exists
        req.requestTime = new Date().getTime();
        const token = jwtUtils.getTokenFromHeader(req);

        if (!token)
            return next(
                new AppError('UnAuthenticated', StatusCodes.UNAUTHORIZED)
            );

        // verify jwt token
        // check for the token is expired or not.
        // jwt will throw JsonWebTokenError if failed to decode.
        const decodedToken: any = await jwtUtils.decode(token);

        // validate the token and the user credentials
        // check if the user exists for the give token.
        const loggedInUser = await User.findById(decodedToken.id);
        if (!loggedInUser)
            return next(
                new AppError(
                    'Invalid Credentials or user associated with the token does not exists.',
                    StatusCodes.UNAUTHORIZED
                )
            );

        // check if password is changed after the token has been generated.

        req.user = loggedInUser;
        res.locals.user = req.user;
        return next();
    }
);

export const isLoggedIn = catchAsync(
    async (req: AppRequest, res: Response, next: NextFunction) => {
        // 1. Get the Token from Request Headers and check if it exists
        req.requestTime = new Date().getTime();
        const token = jwtUtils.getTokenFromHeader(req);

        if (token) {
            // verify jwt token
            // check for the token is expired or not.
            // jwt will throw JsonWebTokenError if failed to decode.
            const decodedToken: any = jwtUtils.decode(token);

            // validate the token and the user credentials
            // check if the user exists for the give token.
            const loggedInUser = await User.findById(decodedToken.id);
            if (!loggedInUser) return next();
            // check if password is changed after the token has been generated.

            req.user = loggedInUser;
            res.locals.user = loggedInUser;
        }
        return next();
    }
);

export const forgotPassword = catchAsync(
    async (req: ForgotPasswordRequest, res: Response, next: NextFunction) => {
        const user = await User.findOne({ email: req.body.email });

        if (!user)
            return next(
                new AppError(
                    'User not registered with this email',
                    StatusCodes.NOT_FOUND
                )
            );

        // User found generate password reset token
        const resetToken = user.createPasswordResetToken();

        // save the user without validating the schema again, to avoid validation failures issue.
        await user.save({ validateBeforeSave: false });

        // send email to the user for the reset token url.
        const resetTokenUrl = `${req.protocol}://${req.get(
            'host'
        )}/v1/auth/forgot/reset/${resetToken}`;

        const emailBody = `Forgot your password?
    // Here is your reset token url \n\n ${resetTokenUrl}`;

        try {
            const email = new emailUtils.Email();
            const options: emailUtils.EmailOptions = {
                to: user.email.valueOf(),
                subject: '<BUDGET TRACKER> Reset your Password.',
                text: emailBody
            };
            await email.send(options);

            return sendSuccess(res, StatusCodes.OK, undefined, {
                message:
                    'An Email is successfully sent to your email address to reset your password.'
            });
        } catch (err) {
            console.error(err);
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;

            await user.save({ validateBeforeSave: false });

            return next(
                new AppError(
                    'Failed to send email to the user',
                    StatusCodes.INTERNAL_SERVER_ERROR
                )
            );
        }
    }
);

export const validateResetToken = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {}
);

export const resetPassword = catchAsync(
    async (req: AppRequest, res: Response, next: NextFunction) => {
        // Get User based on the reset token

        const hashedRestToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        // If token is not expired and user is valid, set the new Password
        const user: any = await User.findOne({
            passwordResetExpires: { $gt: Date.now() },
            passwordResetToken: hashedRestToken
        });

        if (!user && null == user) {
            next(
                new AppError(
                    'The reset token is invalid or Expired',
                    StatusCodes.BAD_REQUEST
                )
            );
        } else {
            // Update Password Change timestamp
            user.password = req.body.password;
            user.passwordConfirm = req.body.passwordConfirm;
            user.passwordResetExpires = undefined;
            user.passwordResetToken = undefined;

            await user.save();
        }
        // Log in the user and send new JWT instead
        return authUtils.createAndSendToken(user, StatusCodes.OK, res);
    }
);

export const restrictTo =
    (..._roles: String[]): any =>
    (req: AppRequest, res: Response, next: NextFunction) => {
        // check TOken if exit or valid
        if (!_roles.includes(req.user.role))
            return next(
                new AppError(
                    'You do not have permission to access this resource',
                    StatusCodes.FORBIDDEN
                )
            );
        return next();
    };

export const getCurrentUser = (
    req: AppRequest,
    res: Response,
    next: NextFunction
) => {
    req.params.id = req.user._id;
    return next();
};

export const updatePassword = catchAsync(
    async (req: UpdatePasswordRequest, res: Response, next: NextFunction) => {
        // Get the current user
        const currentUser: UserDocument | null = await User.findById(
            req.user._id
        ).select('+password');

        if (!currentUser) {
            return next(
                new AppError(
                    'There is no user available. Please login to perform this operation.',
                    StatusCodes.BAD_REQUEST
                )
            );
        }
        // Check posted password is correct
        if (
            !(await currentUser.matchPassword(
                req.body.passwordCurrent,
                currentUser.password
            ))
        ) {
            return next(
                new AppError(
                    'UnAuthorized. Current Password is incorrect',
                    StatusCodes.FORBIDDEN
                )
            );
        }
        // update the password
        currentUser.password = req.body.password;
        currentUser.passwordConfirm = req.body.passwordConfirm;

        await currentUser.save();

        // log the user in
        return authUtils.createAndSendToken(
            currentUser,
            StatusCodes.OK,
            res,
            'Password updated successfully !!'
        );
    }
);
