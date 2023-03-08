"use strict";
/** @format */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const app_constants_1 = require("../utils/constants/app-constants");
const sendSuccess = (res, code, data, options) => res.status(code).json({
    status: app_constants_1.RESPONSE_STATUS.SUCCESS,
    data,
    ...options
});
exports.sendSuccess = sendSuccess;
const sendError = (res, code, message, options) => {
    let status = app_constants_1.RESPONSE_STATUS.ERROR;
    if (`${code}`.startsWith('4')) {
        status = app_constants_1.RESPONSE_STATUS.FAILURE;
    }
    if (!message)
        message = 'Something went wrong !!';
    res.status(code).json({
        status,
        message,
        ...options
    });
};
exports.sendError = sendError;
