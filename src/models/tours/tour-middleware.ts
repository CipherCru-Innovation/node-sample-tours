/** @format */

import slugify from 'slugify';
import {
    CallbackWithoutResultAndOptionalError,
    PreMiddlewareFunction,
    PreSaveMiddlewareFunction,
    Query
} from 'mongoose';
import ITour from '../tour.model';
import IUser from '../user.model';

export const sulgifyTour: PreSaveMiddlewareFunction<ITour> = function (
    this: ITour,
    next: CallbackWithoutResultAndOptionalError
) {
    this.slug = slugify(this.name.valueOf(), { lower: true });
    next();
};

export const preFindTour: PreMiddlewareFunction<ITour> = function (
    this: any,
    next: CallbackWithoutResultAndOptionalError
) {
    console.log('Change instance to ', this);
    this.find({ secretTour: { $ne: true } }).populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
};
