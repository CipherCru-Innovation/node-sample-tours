/** @format */

import { StatusCodes } from 'http-status-codes';
import AppError from './app-error';
import { Request, Response, NextFunction } from 'express';
import { sendError } from '../factory/response-handler';

const handleCastErrorDB = (err: any) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleDuplicateFieldsDB = (err: any) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleValidationErrorDB = (err: any) => {
    const errors = Object.values(err.errors).map((el: any) => el.message);

    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, StatusCodes.BAD_REQUEST);
};

const handleJWTError = () =>
    new AppError(
        'Invalid token. Please log in again!',
        StatusCodes.UNAUTHORIZED
    );

const handleJWTExpiredError = () =>
    new AppError(
        'Your token has expired! Please log in again.',
        StatusCodes.UNAUTHORIZED
    );

const sendErrorDev = (err: any, req: Request, res: Response) => {
    // A) API
    if (
        req.originalUrl.startsWith('/api') ||
        req.originalUrl.startsWith('/v1/auth')
    ) {
        return sendError(res, err.statusCode, err.message, {
            error: err,
            stack: err.stack
        });
    }

    // B) RENDERED WEBSITE
    console.error('ERROR 💥', err);
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message
    });
};

const sendErrorProd = (err: any, req: Request, res: Response) => {
    // A) API
    if (req.originalUrl.startsWith('/api')) {
        // A) Operational, trusted error: send message to client
        if (err.isOperational) {
            return sendError(res, err.statusCode, err.message);
        }
        // B) Programming or other unknown error: don't leak error details
        // 1) Log error
        console.error('ERROR 💥', err);
        // 2) Send generic message
        return sendError(res, StatusCodes.INTERNAL_SERVER_ERROR);
    }
    // B) RENDERED WEBSITE
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.'
    });
};

export default (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'dev') {
        return sendErrorDev(err, req, res);
    }

    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
        error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    return sendErrorProd(error, req, res);
};
