const { StatusCodes } = require('http-status-codes');

const AppError = require('../exceptions/app-error');
const catchAsync = require('../utils/catch-async');
const MongoQueryBuilder = require('../utils/mongo-query-builder');
const sendSuccess = require('./reponse-handler');

exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const data = await Model.findByIdAndDelete(req.params.id);
        if (!data) return next(new AppError('No data found with this Id'), StatusCodes.NOT_FOUND);

        return sendSuccess(res, StatusCodes.NO_CONTENT);
    });

exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const data = {};
        const update = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!update) return next(new AppError('No record found with this Id'), StatusCodes.NOT_FOUND);
        data[`${Model.modelName.toLowerCase()}`] = update;
        return sendSuccess(res, StatusCodes.OK, data);
    });

exports.save = (Model) =>
    catchAsync(async (req, res) => {
        const data = {};
        console.info(req.body);
        const savedModel = await Model.create(req.body);
        data[`${Model.modelName.toLowerCase()}`] = savedModel;
        sendSuccess(res, StatusCodes.CREATED, data);
    });

exports.getById = (Model, populateOptions) =>
    catchAsync(async (req, res, next) => {
        let query = Model.findById(req.params.id);
        const data = {};
        if (populateOptions) query = query.populate(populateOptions);

        const doc = await query;

        if (!doc) return next(new AppError('No record found with this Id'), StatusCodes.NOT_FOUND);
        data[`${Model.modelName.toLowerCase()}`] = doc;
        return sendSuccess(res, StatusCodes.OK, data);
    });

exports.getPaginated = (Model, populateOptions) =>
    catchAsync(async (req, res, next) => {
        const finalQuery = new MongoQueryBuilder(Model.find(), req.query).build();
        const data = {};
        if (populateOptions)
            // TODO: prepare Populate options
            finalQuery.populate(populateOptions);

        const pageData = await finalQuery.getPageData();
        const doc = await finalQuery.query;
        data[`${Model.modelName.toLowerCase()}`] = doc;
        sendSuccess(res, StatusCodes.OK, data, { pageData });
    });
