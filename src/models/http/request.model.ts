/** @format */

import { Request } from 'express';
import ITour from 'models/tour.model';
import IUser from '../user.model';
import { TourQueryParams } from './query';
import Login from './request/login';
import UpdatePassword from './request/updatePassword';

export interface AppRequest<T = any, Q = any>
    extends Request<T, unknown, T, Q | undefined> {
    user: IUser;
    requestTime?: number;
}

export interface TourRequest extends AppRequest<ITour, TourQueryParams> {}

export interface UpdatePasswordRequest
    extends AppRequest<UpdatePassword, unknown> {}

export interface ForgotPasswordRequest
    extends AppRequest<{ email: String }, unknown> {}

export interface LoginRequest extends AppRequest<Login, unknown> {}
