"use strict";
/** @format */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = require("http-status-codes");
const app_error_1 = __importDefault(require("./app-error"));
const response_handler_1 = require("../factory/response-handler");
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new app_error_1.default(message, http_status_codes_1.StatusCodes.BAD_REQUEST);
};
const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new app_error_1.default(message, http_status_codes_1.StatusCodes.BAD_REQUEST);
};
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new app_error_1.default(message, http_status_codes_1.StatusCodes.BAD_REQUEST);
};
const handleJWTError = () => new app_error_1.default('Invalid token. Please log in again!', http_status_codes_1.StatusCodes.UNAUTHORIZED);
const handleJWTExpiredError = () => new app_error_1.default('Your token has expired! Please log in again.', http_status_codes_1.StatusCodes.UNAUTHORIZED);
const sendErrorDev = (err, req, res) => {
    // A) API
    if (req.originalUrl.startsWith('/api') ||
        req.originalUrl.startsWith('/v1/auth')) {
        return (0, response_handler_1.sendError)(res, err.statusCode, err.message, {
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
const sendErrorProd = (err, req, res) => {
    // A) API
    if (req.originalUrl.startsWith('/api')) {
        // A) Operational, trusted error: send message to client
        if (err.isOperational) {
            return (0, response_handler_1.sendError)(res, err.statusCode, err.message);
        }
        // B) Programming or other unknown error: don't leak error details
        // 1) Log error
        console.error('ERROR 💥', err);
        // 2) Send generic message
        return (0, response_handler_1.sendError)(res, http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR);
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
exports.default = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'dev') {
        return sendErrorDev(err, req, res);
    }
    let error = { ...err };
    error.message = err.message;
    if (error.name === 'CastError')
        error = handleCastErrorDB(error);
    if (error.code === 11000)
        error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
        error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError')
        error = handleJWTError();
    if (error.name === 'TokenExpiredError')
        error = handleJWTExpiredError();
    return sendErrorProd(error, req, res);
};
