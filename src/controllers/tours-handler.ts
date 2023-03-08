/** @format */

import { NextFunction, Response } from 'express';
import { AppRequest } from '../models/http/request.model';

/** @format */
const multer = require('multer');
const sharp = require('sharp');
const { StatusCodes } = require('http-status-codes');

const Tour = require('../../models/tours/tour-model');
// const catchAsync = require('../utils/catchAsync');
const dataFactory = require('../../factory/data-handler-factory');
const AppError = require('../../exceptions/app-error');
const catchAsync = require('../../utils/catch-async');

const multerStorage = multer.memoryStorage();

const multerFilter = (req: AppRequest, file: any, callback: Function) => {
    console.info(file);
    if (file.mimetype.startsWith('image')) callback(null, true);
    else
        callback(
            new AppError('Invalid Image Format', StatusCodes.BAD_REQUEST),
            false
        );
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
        console.log(req.body);
        return next();
    }
);

export const getAllTour = dataFactory.getPaginated(Tour);
export const getTourById = dataFactory.getById(Tour);
export const createNewTour = dataFactory.save(Tour);
export const updateTour = dataFactory.updateOne(Tour);
export const deleteTour = dataFactory.deleteOne(Tour);
