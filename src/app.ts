/** @format */
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import helmet from 'helmet';
import { StatusCodes } from 'http-status-codes';
import mongoSanitize from 'express-mongo-sanitize';
import AppError from './exceptions/app-error';
import globalErrorHandler from './exceptions/global-error-handler';
import tourRouter from './routes/tour-route';
import authRouter from './routes/auth-route';
import viewRouter from './routes/view-route';
import reviewRouter from './routes/review-route';

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));
console.log(path.join(__dirname, 'public'));

app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

if (process.env.NODE_ENV !== 'prod') app.use(morgan('dev'));
// Implement rate limiter
// const limiter = rateLimit({
//     max: process.env.RATE_LIMIT as number,
//     windowMs: process.env.RATE_LIMIT_WINDOW_MS,
//     message: 'Too many requests from this client, Please try again later'
// });

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
//app.use('/api', limiter);
// Data sanitization
app.use(mongoSanitize());
app.use(express.urlencoded({ extended: true }));

app.use('/', viewRouter);
app.use('/v1/auth', authRouter);
app.use('/api/v1/tour', tourRouter);
app.use('/api/v1/reviews', reviewRouter);

// Invalid route Handler
app.all('*', (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Cannot find the url ${req.url}`, StatusCodes.NOT_FOUND));
});

// Global Error Controller for all the errors.
app.use(globalErrorHandler);

module.exports = app;
