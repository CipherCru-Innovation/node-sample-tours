"use strict";
/** @format */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTour = exports.updateTour = exports.createNewTour = exports.getTourById = exports.getAllTour = exports.resizeTourImages = exports.uploadTourImages = void 0;
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
const multerFilter = (req, file, callback) => {
    console.info(file);
    if (file.mimetype.startsWith('image'))
        callback(null, true);
    else
        callback(new AppError('Invalid Image Format', StatusCodes.BAD_REQUEST), false);
};
const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});
exports.uploadTourImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 5 }
]);
exports.resizeTourImages = catchAsync(async (req, res, next) => {
    if (!req.files || !req.files.images)
        return next();
    const imageCoverName = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/tours/${imageCoverName}`);
    req.body.imageCover = imageCoverName;
    req.body.images = [];
    await Promise.all(req.files.images.map(async (imageField, index) => {
        const imageName = `tour-${req.params.id}-${Date.now()}-${index}.jpeg`;
        await sharp(imageField.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/images/tours/${imageName}`);
        req.body.images.push(imageName);
    }));
    console.log(req.body);
    return next();
});
exports.getAllTour = dataFactory.getPaginated(Tour);
exports.getTourById = dataFactory.getById(Tour);
exports.createNewTour = dataFactory.save(Tour);
exports.updateTour = dataFactory.updateOne(Tour);
exports.deleteTour = dataFactory.deleteOne(Tour);
