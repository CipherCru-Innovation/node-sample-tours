"use strict";
/** @format */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preFindTour = exports.sulgifyTour = void 0;
const slugify_1 = __importDefault(require("slugify"));
const sulgifyTour = function (next) {
    this.slug = (0, slugify_1.default)(this.name.valueOf(), { lower: true });
    next();
};
exports.sulgifyTour = sulgifyTour;
const preFindTour = function (next) {
    console.log('Change instance to ', this);
    this.find({ secretTour: { $ne: true } }).populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });
    next();
};
exports.preFindTour = preFindTour;
