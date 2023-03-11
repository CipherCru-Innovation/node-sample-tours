/** @format */

import { StatusCodes } from 'http-status-codes';
import { Request, Response } from 'express';

import * as jwtUtils from './jwt-utils';
import cookieOption from './constants/cookieOptions';
import { sendSuccess } from '../factory/response-handler';
import IUser from '../models/user.model';

export const createAndSendToken = (
    user: IUser,
    statusCode: StatusCodes,
    res: Response,
    message?: String
) => {
    const token = jwtUtils.signToken(user._id, user.email);

    res.cookie('authToken', token, cookieOption(24 * 60 * 60 * 1000));
    return sendSuccess(res, statusCode, { user }, { message, token });
};

export const logoutUser = (req: Request, res: Response) => {
    const token = jwtUtils.getTokenFromHeader(req);
    res.cookie('authToken', token, cookieOption());
    return sendSuccess(res, StatusCodes.OK);
};
