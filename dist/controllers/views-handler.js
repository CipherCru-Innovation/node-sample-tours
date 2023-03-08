"use strict";
/** @format */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.getLoginForm = exports.getTour = exports.getOverview = void 0;
const http_status_codes_1 = require("http-status-codes");
const app_error_1 = __importDefault(require("../exceptions/app-error"));
const tour_1 = __importDefault(require("../models/tours/tour"));
const catch_async_1 = __importDefault(require("../utils/catch-async"));
exports.getOverview = (0, catch_async_1.default)(async (req, res, next) => {
    // Get Tours form DB
    const tours = await tour_1.default.find();
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    });
});
exports.getTour = (0, catch_async_1.default)(async (req, res, next) => {
    const { slug } = req.params;
    const tour = await tour_1.default.findOne({ slug }).populate('reviews');
    if (!tour)
        return next(new app_error_1.default('No Tour found', http_status_codes_1.StatusCodes.NOT_FOUND));
    res.status(200)
        .set('Content-Security-Policy', "default-src 'self' https://*.mapbox.com; base-uri 'self'; block-all-mixed-content; font-src 'self' https:; frame-ancestors 'self'; img-src 'self' blob: data:; object-src 'none'; script-src 'unsafe-inline' https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob:; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests;")
        .render('tour', { title: tour.name, tour });
});
const getLoginForm = (req, res) => {
    res.status(http_status_codes_1.StatusCodes.OK).render('login');
};
exports.getLoginForm = getLoginForm;
const getProfile = (req, res) => {
    res.status(http_status_codes_1.StatusCodes.OK).render('profile', {
        title: 'User Profile'
    });
};
exports.getProfile = getProfile;
