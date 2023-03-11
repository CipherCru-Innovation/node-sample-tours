/** @format */

import { NextFunction, Response, Request } from 'express';

import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
import { StatusCodes } from 'http-status-codes';
import tour from '../models/tours/tour';
import * as dataFactory from '../factory/data-handler-factory';
import Error from '../exceptions/app-error';
import catchAsync from '../utils/catch-async';

const multerStorage = multer.memoryStorage();

const multerFilter = (
    req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback
) => {
    if (file.mimetype.startsWith('image')) callback(null, true);
    else callback(new Error('Invalid Image Format', StatusCodes.BAD_REQUEST));
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

export const uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 5 }
]);

export const resizeTourImages = catchAsync(
    async (req: any, res: Response, next: NextFunction) => {
        if (!req.files || !req.files.images) return next();

        const imageCoverName = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
        await sharp(req.files.imageCover[0].buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/images/tours/${imageCoverName}`);

        req.body.imageCover = imageCoverName;

        req.body.images = [];
        await Promise.all(
            req.files.images.map(async (imageField: any, index: number) => {
                const imageName = `tour-${
                    req.params.id
                }-${Date.now()}-${index}.jpeg`;

                await sharp(imageField.buffer)
                    .resize(2000, 1333)
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toFile(`public/images/tours/${imageName}`);

                req.body.images.push(imageName);
            })
        );
        return next();
    }
);

export const getTourById = dataFactory.getById(tour);
export const createNewTour = dataFactory.save(tour);
export const updateTour = dataFactory.updateOne(tour);
export const deleteTour = dataFactory.deleteOne(tour);
export const getAllTour = dataFactory.getPaginated(tour);
