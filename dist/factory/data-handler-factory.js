"use strict";
/** @format */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginated = exports.getById = exports.save = exports.updateOne = exports.deleteOne = void 0;
const http_status_codes_1 = require("http-status-codes");
const app_error_1 = __importDefault(require("../exceptions/app-error"));
const catch_async_1 = __importDefault(require("../utils/catch-async"));
const response_handler_1 = require("./response-handler");
const MongoQueryBuilder = require('../utils/mongo-query-builder');
const deleteOne = (m) => (0, catch_async_1.default)(async (req, res, next) => {
    const data = await m.findByIdAndDelete(req.params.id);
    if (!data)
        return next(new app_error_1.default('No data found with this Id', http_status_codes_1.StatusCodes.NOT_FOUND));
    return (0, response_handler_1.sendSuccess)(res, http_status_codes_1.StatusCodes.NO_CONTENT);
});
exports.deleteOne = deleteOne;
const updateOne = (m) => (0, catch_async_1.default)(async (req, res, next) => {
    const update = await m.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!update)
        return next(new app_error_1.default('No record found with this Id', http_status_codes_1.StatusCodes.NOT_FOUND));
    const data = {
        [m.modelName]: update
    };
    return (0, response_handler_1.sendSuccess)(res, http_status_codes_1.StatusCodes.OK, data);
});
exports.updateOne = updateOne;
const save = (m) => (0, catch_async_1.default)(async (req, res) => {
    const savedModel = await m.create(req.body);
    const data = { [m.modelName.toLowerCase()]: savedModel };
    (0, response_handler_1.sendSuccess)(res, http_status_codes_1.StatusCodes.CREATED, data);
});
exports.save = save;
const getById = (m, populateOptions) => (0, catch_async_1.default)(async (req, res, next) => {
    let query = m.findById(req.params.id);
    if (populateOptions)
        query = query.populate(populateOptions);
    const doc = await query;
    if (!doc)
        return next(new app_error_1.default('No record found with this Id', http_status_codes_1.StatusCodes.NOT_FOUND));
    const data = { [m.modelName.toLowerCase()]: doc };
    return (0, response_handler_1.sendSuccess)(res, http_status_codes_1.StatusCodes.OK, data);
});
exports.getById = getById;
const getPaginated = (m, populateOptions) => (0, catch_async_1.default)(async (req, res, next) => {
    const finalQuery = new MongoQueryBuilder(m.find(), req.query).build();
    if (populateOptions)
        // TODO: prepare Populate options
        finalQuery.populate(populateOptions);
    const pageData = await finalQuery.getPageData();
    const doc = await finalQuery.query;
    const data = { [m.modelName.toLowerCase()]: doc };
    (0, response_handler_1.sendSuccess)(res, http_status_codes_1.StatusCodes.OK, data, { pageData });
});
exports.getPaginated = getPaginated;
