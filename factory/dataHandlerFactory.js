const { STATUS_CODES } = require('http');
const { StatusCodes } = require('http-status-codes');

const AppError = require('../exceptions/app-error');
const catchAsync = require('../utils/catchAsync');
const MongoQueryBuilder = require('../utils/mongo-query-builder');

const sendResponse = (res, code, key, responseData, message) => {
    const data = {};
    data[key] = responseData;
    return res.status(code).json({
        status: 'SUCCESS',
        data,
        message
    });
};

exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const tour = await Model.findByIdAndDelete(req.params.id);

        if (!tour) return next(new AppError('No model found with this Id'), 404);

        return res.status(StatusCodes.NO_CONTENT).json({
            status: 'SUCCESS'
        });
    });

exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const update = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!update) return next(new AppError('No record found with this Id'), 404);

        return res.status(StatusCodes.OK).json({
            status: 'success',
            data: {
                update
            }
        });
    });

exports.save = (Model) =>
    catchAsync(async (req, res, next) => {
        const data = await Model.create(req.body);

        res.status(StatusCodes.CREATED).json({
            status: 'SUCCESS',
            data: {
                data
            }
        });
    });

exports.getById = (Model, populateOptions) =>
    catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);
        if (populateOptions) query = query.populate(populateOptions);

        const doc = await query;

        if (!doc) return next(new AppError('No record found with this Id'), StatusCodes.NOT_FOUND);

        return sendResponse(res, StatusCodes.OK, Model.modelName.toLowerCase(), doc);
    });

exports.getPaginated = (Model, populateOptions) =>
    catchAsync(async (req, res, next) => {
        const finalQuery = new MongoQueryBuilder(Model.find(), req.query).sortData().fields().filter().paginate();

        if (populateOptions)
            // TODO: prepare Populate options
            finalQuery.populate(populateOptions);

        const pageData = await finalQuery.getPageData();
        const doc = await finalQuery.query;

        res.status(STATUS_CODES.CREATED).json({
            status: 'SUCCESS',
            results: doc.length,
            ...pageData,
            data: {
                doc
            }
        });
    });

exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        const finalQuery = new MongoQueryBuilder(Model.find(), req.query).sortData().fields().filter();
        const doc = await finalQuery.query;

        res.status(200).json({
            status: 'SUCCESS',
            results: doc.length,
            data: {
                doc
            }
        });
    });
