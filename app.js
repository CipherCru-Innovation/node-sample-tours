const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { StatusCodes } = require('http-status-codes');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const app = express();

app.use(helmet());

if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// Implement rate limiter
const limiter = rateLimit({
    max: process.env.RATE_LIMIT,
    windowMs: process.env.RATE_LIMIT_WINDOW_MS,
    message: 'Too many requests from this client, Please try again later'
});

app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));

// Data sanitization
app.use(mongoSanitize());
app.use(xss());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(`${__dirname}/public`));

// Invalid route Handler
// app.all('*', (req, res, next) => {
//     next(new AppError(`Cannot find the url ${req.url}`, StatusCodes.NOT_FOUND));
// });

// Global Error Controller for all the errors.
//app.use(globalErrorController);

module.exports = app;
