/** @format */

import { NextFunction, Request, Response } from 'express';

import { StatusCodes } from 'http-status-codes';
import AppError from '../exceptions/app-error';
import ITour from '../models/tour.model';

import Tour from '../models/tours/tour';
import catchAsync from '../utils/catch-async';

export const getOverview = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        // Get Tours form DB
        const tours: ITour[] = await Tour.find();
        console.log(tours);
        res.status(200).render('overview', {
            title: 'All tours',
            tours
        });
    }
);

export const getTour = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { slug } = req.params;
        const tour = await Tour.findOne({ slug }).populate('reviews');

        if (!tour)
            return next(new AppError('No Tour found', StatusCodes.NOT_FOUND));
        res.status(200)
            .set(
                'Content-Security-Policy',

                "default-src 'self' https://*.mapbox.com; base-uri 'self'; block-all-mixed-content; font-src 'self' https:; frame-ancestors 'self'; img-src 'self' blob: data:; object-src 'none'; script-src 'unsafe-inline' https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob:; style-src 'self' https: 'unsafe-inline'; upgrade-insecure-requests;"
            )
            .render('tour', { title: tour.name, tour });
    }
);

export const getLoginForm = (req: Request, res: Response) => {
    res.status(StatusCodes.OK).render('login');
};

export const getProfile = (req: Request, res: Response) => {
    res.status(StatusCodes.OK).render('profile', {
        title: 'User Profile'
    });
};
