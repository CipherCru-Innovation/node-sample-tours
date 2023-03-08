/** @format */

import { RESPONSE_STATUS } from '../utils/constants/app-constants';
import { Response } from 'express';
export const sendSuccess = (
    res: Response,
    code: number,
    data?: any,
    options?: any
) =>
    res.status(code).json({
        status: RESPONSE_STATUS.SUCCESS,
        data,
        ...options
    });

export const sendError = (
    res: Response,
    code: number,
    message?: String,
    options?: any
) => {
    let status = RESPONSE_STATUS.ERROR;

    if (`${code}`.startsWith('4')) {
        status = RESPONSE_STATUS.FAILURE;
    }
    if (!message) message = 'Something went wrong !!';

    res.status(code).json({
        status,
        message,
        ...options
    });
};
