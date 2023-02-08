const mongoose = require('mongoose');
const tourMiddleware = require('./tour-middleware');

const tourSchema = new mongoose.Schema(
    /* 
    ================================================================
    Schema Definition
    ================================================================
    */
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: [true, 'A tour name must be unique'],
            maxLength: [40, 'Name must be less than equal 40 characters'],
            minLength: [10, 'Name must be greater than 10 characters']
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
            required: [true, 'A tour must have a difficulty level'],
            trim: true,
            upper: true,
            enum: {
                values: ['easy', 'medium', 'difficult'],
                messages: ["difficulty must be either 'easy','medium' or 'difficult'"]
            }
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
            min: [1, 'A tour price must be greater than 1']
        },

        priceDiscount: {
            type: Number,
            validate: {
                validator: function () {
                    // NOTE: This function will not work while updating the document due to mongoose constraints.
                    return this.priceDiscount < this.price;
                },
                message: 'A tour discount {VALUE} cannot be greater than price itself'
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
        //   Audit properties
        createdAt: {
            type: Date,
            default: Date.now()
        },
        slug: String,
        secretTour: {
            type: Boolean,
            default: false
        },
        startLocation: {
            // GeoJson
            type: {
                type: String,
                default: 'Point',
                enum: {
                    values: ['Point'],
                    messages: 'The can only be type point'
                }
            },
            coordinates: [Number],
            address: String,
            description: String
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: {
                        values: ['Point'],
                        messages: 'The can only be type point'
                    }
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number
            }
        ],
        guides: [
            {
                type: mongoose.Schema.ObjectId,
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
        id: false
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

tourSchema.virtual('durationWeeks').get(function (next) {
    return this.duration / 7;
});

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});

// Save middleware only works with .save() & .create() methods
tourSchema.pre('save', tourMiddleware.sulgifyTour);

// run with all the queries whcih starts with find such as find, findone, findOneAndUpdate etc.
tourSchema.pre('/^find/', tourMiddleware.preFindTour);

// tourSchema.pre('aggregate', function (next) {
//     this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//     next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
