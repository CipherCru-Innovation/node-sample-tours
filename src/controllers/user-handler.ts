/** @format */

import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';
import User from '../models/users/user';
import AppError from '../exceptions/app-error';
import catchAsync from '../utils/catch-async';
import * as dataFactory from '../factory/data-handler-factory';
import { sendSuccess } from '../factory/response-handler';
import { AppRequest } from '../models/http/request.model';

const multerStorage = multer.memoryStorage();

const multerFilter = (req: Request, file: any, callback: Function) => {
    console.info(file);
    if (file.mimetype.startsWith('image')) callback(null, true);
    else
        callback(
            new AppError('Invalid Image Format', StatusCodes.BAD_REQUEST),
            false
        );
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = catchAsync(
    async (req: AppRequest, res: Response, next: NextFunction) => {
        if (!req.file) return next();

        req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
        await sharp(req.file.buffer)
            .resize(500, 500)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/images/users/${req.file.filename}`);

        return next();
    }
);

const sanitizeUserBody = (data: any, ...fields: String[]) => {
    const sanitized: any = {};
    Object.keys(data).forEach((field) => {
        if (fields.includes(field)) sanitized[field] = data[field];
    });

    return sanitized;
};

export const updateMe = catchAsync(
    async (req: AppRequest, res: Response, next: NextFunction) => {
        if (req.body.password || req.body.passwordConfirm)
            return next(
                new AppError(
                    'Can not update the password with this request',
                    StatusCodes.BAD_REQUEST
                )
            );

        const updateOptions = sanitizeUserBody(
            req.body,
            'name',
            'email',
            'profile'
        );
        if (req.file) updateOptions.photo = req.file.filename;
        // update the user document with the given id
        const user = await User.findByIdAndUpdate(req.user._id, updateOptions, {
            new: true,
            runValidators: true
        });
        if (!user) {
            // since the id is derived from the jwt token. The user must exist already and should be a valid one.
            return next(
                new AppError(
                    'Something went wrong while updating the user details',
                    StatusCodes.INTERNAL_SERVER_ERROR
                )
            );
        }

        return sendSuccess(res, StatusCodes.OK, user);
    }
);

export const deleteMe = catchAsync(
    async (req: AppRequest, res: Response, next: NextFunction) => {
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
                new AppError(
                    'Something went wrong while updating the user details',
                    StatusCodes.INTERNAL_SERVER_ERROR
                )
            );
        }
        return sendSuccess(res, StatusCodes.NO_CONTENT);
    }
);

export const getUser = dataFactory.getById(User);
