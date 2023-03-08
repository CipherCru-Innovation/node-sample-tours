/** @format */

import { Schema } from 'mongoose';
import IReview from './review.model';
import IUser from './user.model';

interface ITour {
    name: String;
    ratingAverage: Number;
    ratingQuantity: Number;
    difficulty: String;
    price: Number;
    priceDiscount?: Number;
    summary: String;
    description?: String;
    images?: String[];
    imageCover: String;
    maxGroupSize: Number;
    duration: Number;
    startDates: Date[];
    slug: String;
    secretTout: Boolean;
    guides: Schema.Types.ObjectId | IUser;
    durationWeeks?: Number;
    reviews?: IReview[];
    createdAt?: Date;
    updatedAt?: Date;
}
export default ITour;
