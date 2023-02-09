const { StatusCodes } = require('http-status-codes');

const User = require('../models/users/user');
const AppError = require('../exceptions/app-error');
const catchAsync = require('../utils/catch-async');
const dataFactory = require('../factory/data-handler-factory');
const sendSuccess = require('../factory/reponse-handler');

const sanitizeUserBody = (data, ...fields) => {
    const sanitized = {};
    Object.keys(data).forEach((field) => {
        if (fields.includes(field)) sanitized[field] = data[field];
    });

    return sanitized;
};

exports.updateMe = catchAsync(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm)
        return next(new AppError('Can not update the password with this request'), StatusCodes.BAD_REQUEST);

    const updateOptions = sanitizeUserBody(req.body, 'name', 'email', 'profile');
    // update the user document with the given id
    const user = await User.findByIdAndUpdate(req.user._id, updateOptions, {
        new: true,
        runValidators: true
    });
    if (!user) {
        // since the id is derived from the jwt token. The user must exist already and should be a valid one.
        return next(
            new AppError('Something went wrong while updating the user details', StatusCodes.INTERNAL_SERVER_ERROR)
        );
    }

    sendSuccess(res, StatusCodes.OK, user);
});

exports.deleteMe = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { active: false },
        {
            new: true,
            runValidators: true
        }
    );
    if (!user) {
        // since the id is derived from the jwt token. The user must exist already and should be a valid one.
        return next(
            new AppError('Something went wrong while updating the user details', StatusCodes.INTERNAL_SERVER_ERROR)
        );
    }
    sendSuccess(res, StatusCodes.NO_CONTENT);
});

exports.getUser = dataFactory.getById(User);
