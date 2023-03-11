/** @format */
import mongoose, { Model, Schema } from 'mongoose';
import IReview from '../review.model';
import tour from '../tours/tour';

interface ReviewModel extends Model<IReview> {
    calcAverageRatings(tourId: string): void;
}
const reviewSchema = new Schema<IReview, ReviewModel>(
    {
        review: {
            type: String,
            required: [true, 'Review can not be empty!']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        tour: {
            type: Schema.Types.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour.']
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user']
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //   path: 'tour',
    //   select: 'name'
    // }).populate({
    //   path: 'user',
    //   select: 'name photo'
    // });

    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

reviewSchema.static('calcAverageRating', async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
});

reviewSchema.post('save', function () {
    // this points to current review
    // FIXME : TO be debugged.
    //this.constructor.calcAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
    //this.r = await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function (doc: Document) {
    // await this.findOne(); does NOT work here, query has already executed
    //await this.r.constructor.calcAverageRatings(this.r.tour);
});

export default mongoose.model<IReview, ReviewModel>('Review', reviewSchema);
