/** @format */
import { Types } from 'mongoose';
interface IReview {
    review: String;
    rating: Number;
    tour: Types.ObjectId;
    user: Types.ObjectId;
    r?: any;
}

export default IReview;
