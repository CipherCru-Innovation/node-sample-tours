/** @format */

import { StatusCodes } from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';
import AppError from '../exceptions/app-error';
import catchAsync from '../utils/catch-async';
import { sendSuccess } from './response-handler';
import { Model } from 'mongoose';

import MongoQueryBuilder from '../utils/mongo-query-builder';
import { TourRequest } from 'models/http/request.model';

export const deleteOne = (m: Model<any>) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const data = await m.findByIdAndDelete(req.params.id);
        if (!data)
            return next(
                new AppError(
                    'No data found with this Id',
                    StatusCodes.NOT_FOUND
                )
            );

        return sendSuccess(res, StatusCodes.NO_CONTENT);
    });

export const updateOne = (m: Model<any>) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const update = await m.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!update)
            return next(
                new AppError(
                    'No record found with this Id',
                    StatusCodes.NOT_FOUND
                )
            );
        const data = {
            [m.modelName]: update
        };
        return sendSuccess(res, StatusCodes.OK, data);
    });

export const save = (m: Model<any>) =>
    catchAsync(async (req: Request, res: Response) => {
        const savedModel = await m.create(req.body);
        const data = { [m.modelName.toLowerCase()]: savedModel };
        sendSuccess(res, StatusCodes.CREATED, data);
    });

export const getById = (m: Model<any>, populateOptions?: any) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let query = m.findById(req.params.id);

        if (populateOptions) query = query.populate(populateOptions);

        const doc = await query;

        if (!doc)
            return next(
                new AppError(
                    'No record found with this Id',
                    StatusCodes.NOT_FOUND
                )
            );
        const data = { [m.modelName.toLowerCase()]: doc };
        return sendSuccess(res, StatusCodes.OK, data);
    });

export const getPaginated = <T>(m: Model<T>, options?: any) =>
    catchAsync(async (req: TourRequest, res: Response, next: NextFunction) => {
        const finalQuery = new MongoQueryBuilder(
            m.find({ notInSchema: 1 }),
            req.query
        ).build();
        // if (populateOptions)
        //     // TODO: prepare Populate options
        //     finalQuery.populate(populateOptions);

        const pageData = await finalQuery.getPageData();
        const doc = await finalQuery.query;

        const data = { [m.modelName.toLowerCase()]: doc };
        sendSuccess(res, StatusCodes.OK, data, { pageData });
    });
