"use strict";
/** @format */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const tour_difficulty_1 = require("../data/tour.difficulty");
const tourMiddleware = require('./tour-middleware');
const tourSchema = new mongoose_1.Schema({
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
            values: Object.keys(tour_difficulty_1.TOUR_DIFFICULTY),
            message: `Allowed values for payment methods are ${tour_difficulty_1.TOUR_DIFFICULTY}`
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
            validator: function (value) {
                // NOTE: This function will not work while updating the document due to mongoose constraints.
                return value < this.price;
            },
            message: 'A tour discount {VALUE} cannot be greater than price itself'
        }
    },
    guides: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
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
});
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
exports.default = mongoose_1.default.model('Tour', tourSchema);
