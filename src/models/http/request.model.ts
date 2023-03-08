/** @format */

import { Request } from 'express';
import IUser from '../user.model';

export interface AppRequest extends Request {
    user: IUser;
    requestTime?: number;
}
