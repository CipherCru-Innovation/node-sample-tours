/** @format */

import mongoose, { HydratedDocument, Schema } from 'mongoose';
import { bool } from 'sharp';
import { TOUR_DIFFICULTY } from '../data/tour.difficulty';
const tourMiddleware = require('./tour-middleware');

import ITour from '../tour.model';

const tourSchema = new Schema<ITour>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            maxLength: 40,
            minLength: 10
        },
        ratingAverage: {
            type: Number,
            default: 3,
            min: [1, 'rating must be between 1 and 5 '],
            max: [5, 'rating must be between 1 and 5 ']
        },
        ratingQuantity: {
            type: Number,
            default: 0
        },
        difficulty: {
            type: String,
            required: true,
            trim: true,
            upper: true,
            enum: {
                values: Object.keys(TOUR_DIFFICULTY),
                message: `Allowed values for payment methods are ${TOUR_DIFFICULTY}`
            }
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a a short summary']
        },
        description: {
            type: String,
            trim: true
        },
        images: [String],
        imageCover: {
            type: String,
            required: [true, 'A tour must have a image cover']
        },
        maxGroupSize: {
            required: [true, 'A tour must have a max group size'],
            type: Number
        },
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration']
        },
        startDates: [Date],
        slug: String,
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
            min: [1, 'A tour price must be greater than 1']
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (
                    this: HydratedDocument<ITour>,
                    value: Number
                ) {
                    // NOTE: This function will not work while updating the document due to mongoose constraints.
                    return value < this.price;
                },
                message:
                    'A tour discount {VALUE} cannot be greater than price itself'
            }
        },
        guides: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    /* 
    ================================================================
    Schema Options
    ================================================================
    */
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        id: false,
        timestamps: true
    }
);
/*
================================================================
Indexes
****************************************************************
================================================================
*/

tourSchema.index({ price: -1, duration: 1, maxGroupSize: -1 });
tourSchema.index({ secretTour: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
/*
================================================================
Virtual properties
****************************************************************
Use a regular function when we need to use the this keyword
TODO: populate virtual properties on filter query
================================================================
*/

tourSchema.virtual('durationWeeks').get(function (this: ITour, next: Function) {
    return this.duration.valueOf() / 7;
});

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

// Save middleware only works with .save() & .create() methods
tourSchema.pre('save', tourMiddleware.sulgifyTour);

// run with all the queries whcih starts with find such as find, findone, findOneAndUpdate etc.
tourSchema.pre(/^find/, tourMiddleware.preFindTour);

// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//     next();
// });

export default mongoose.model('Tour', tourSchema);
