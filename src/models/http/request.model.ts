/** @format */

import { Request } from 'express';
import ITour from 'models/tour.model';
import IUser from '../user.model';
import QueryParams from './query';

export interface AppRequest<T, Q> extends Request<T, unknown, unknown, Q> {
    user: IUser;
    requestTime?: number;
}

export interface TourRequest extends AppRequest<ITour, QueryParams> {}
