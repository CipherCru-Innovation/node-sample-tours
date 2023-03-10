/** @format */

import mongoose, { Schema } from 'mongoose';
import IReview from './review.model';
import IUser from './user.model';

interface ILocation {
    type: 'Point';
    coordinates: Number[];
    address: String;
    description: String;
}

interface ILocationWithDays extends ILocation {
    day: Number;
}
interface ITour extends mongoose.Document {
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
    guides: Schema.Types.ObjectId[] | IUser[];
    startLocation: ILocation;
    locations: ILocationWithDays[];
    durationWeeks?: Number;
    reviews?: IReview[];
    createdAt?: Date;
    updatedAt?: Date;
}

export default ITour;
