const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const inflector = require('json-inflector');
const helmet = require('helmet');
const { StatusCodes } = require('http-status-codes');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const AppError = require('./exceptions/app-error');
const globalErrorHanlder = require('./exceptions/global-error-handler');
const tourRouter = require('./routes/tour-route');
const authRouter = require('./routes/auth-route');

const app = express();

app.use(helmet());

if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Implement rate limiter
const limiter = rateLimit({
    max: process.env.RATE_LIMIT,
    windowMs: process.env.RATE_LIMIT_WINDOW_MS,
    message: 'Too many requests from this client, Please try again later'
});

app.use(express.json({ limit: '10kb' }));
app.use(
    '/api',
    limiter,
    inflector({
        request: 'camelizeLower',
        response: 'underscore'
    })
);
// Data sanitization
app.use(mongoSanitize());
app.use(xss());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(`${__dirname}/public`));

app.use('/v1/auth', authRouter);
app.use('/api/v1/tour', tourRouter);

// Invalid route Handler
app.all('*', (req, res, next) => {
    next(new AppError(`Cannot find the url ${req.url}`, StatusCodes.NOT_FOUND));
});

// Global Error Controller for all the errors.
app.use(globalErrorHanlder);

module.exports = app;
