const crypto = require('crypto');
const { StatusCodes } = require('http-status-codes');
const User = require('../models/users/user');

const catchAsync = require('../utils/catch-async');
const authUtils = require('../utils/auth-utils');
const jwtUtils = require('../utils/jwt-utils');
const emailUtils = require('../utils/email-utils');
const AppError = require('../exceptions/app-error');
const { sendSuccess } = require('../factory/reponse-handler');

exports.signup = catchAsync(async (req, res, next) => {
    // find if user already exists with the email then send the activation link to the user to re-activate the account. Else create a new accoun
    const user = await User.create(req.body);

    return authUtils.createAndSendToken(user, StatusCodes.CREATED, res);
});

// TODO: limit user Login to 3 failed attempts
exports.login = catchAsync(async (req, res, next) => {
    const { username, password } = req.body;

    console.info(req.body);
    // If email and password exists
    if (!username || !password) {
        return next(new AppError('Invalid credentials', StatusCodes.BAD_REQUEST));
    }

    // check user exits and password matches
    // explicitly select password since it will not be pulled in data by default due to model constraints
    const loggedInUser = await User.findOne({ email: username }).select('+password');

    // generate Tokena and send response
    if (!loggedInUser || !(await loggedInUser.matchPassword(password, loggedInUser.password)))
        return next(new AppError('Invalid credentials', StatusCodes.BAD_REQUEST));

    return authUtils.createAndSendToken(loggedInUser, StatusCodes.OK, res);
});

exports.isAuthenticated = catchAsync(async (req, res, next) => {
    // 1. Get the Token from Request Headers and check if it exists
    req.requestTime = new Date().getTime();
    const token = jwtUtils.getTokenFromHeader(req);

    if (!token) return next(new AppError('UnAuthenticated', StatusCodes.UNAUTHORIZED));

    // verify jwt token
    // check for the token is expired or not.
    // jwt will throw JsonWebTokenError if failed to decode.
    const decodedToken = await jwtUtils.decode(token);

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
    return next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return next(new AppError('User not registered with this email', StatusCodes.NOT_FOUND));

    // User found generate password reset token
    const resetToken = user.createPasswordResetToken();

    // save the user without validating the schema again, to avoid validation failures issue.
    await user.save({ validateBeforeSave: false });

    // send email to the user for the reset token url.
    const resetTokenUrl = `${req.protocol}://${req.get('host')}/v1/auth/forgot/reset/${resetToken}`;

    const emailbody = `Forgot your password?
    // Here is your reset token url \n\n ${resetTokenUrl}`;

    try {
        await emailUtils({
            to: user.email,
            subject: '<BUDGET TRACKER> Reset your Passoword.',
            text: emailbody
        });

        sendSuccess(res, StatusCodes.OK, undefined, {
            message: 'An Email is successfully sent to your email address to reset your password.'
        });
    } catch (err) {
        console.error(err);
        user.password_reset_token = undefined;
        user.password_reset_exiration = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new AppError('Failed to send email to the user', StatusCodes.INTERNAL_SERVER_ERROR));
    }
});

exports.validateResetToken = catchAsync(async (req, res, next) => {});
exports.resetPassword = catchAsync(async (req, res, next) => {
    // Get User based on the reset token

    const hashedRestToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // If token is not expired and user is valid, set the new Password
    const user = await User.findOne({
        passwordResetExpires: { $gt: Date.now() },
        passwordResetToken: hashedRestToken
    });

    if (!user) next(new AppError('The reset token is invalid or Expired', StatusCodes.BAD_REQUEST));
    // Update Password Change timestamp
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;

    await user.save();

    // Log in the user and send new JWT instead
    authUtils.createAndSendToken(user, StatusCodes.OK, res);
});

exports.getCurrentUser = (req, res, next) => {
    req.params.id = req.user._id;
    return next();
};
