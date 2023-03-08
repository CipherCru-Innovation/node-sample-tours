"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/** @format */
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const http_status_codes_1 = require("http-status-codes");
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const app_error_1 = __importDefault(require("./exceptions/app-error"));
const global_error_handler_1 = __importDefault(require("./exceptions/global-error-handler"));
const tour_route_1 = __importDefault(require("./routes/tour-route"));
const auth_route_1 = __importDefault(require("./routes/auth-route"));
const view_route_1 = __importDefault(require("./routes/view-route"));
const review_route_1 = __importDefault(require("./routes/review-route"));
const app = (0, express_1.default)();
app.set('view engine', 'pug');
app.set('views', path_1.default.join(__dirname, 'views'));
app.use((0, cors_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use(helmet_1.default.crossOriginResourcePolicy({ policy: 'cross-origin' }));
if (process.env.NODE_ENV !== 'prod')
    app.use((0, morgan_1.default)('dev'));
// Implement rate limiter
const limiter = (0, express_rate_limit_1.default)({
    max: process.env.RATE_LIMIT,
    windowMs: process.env.RATE_LIMIT_WINDOW_MS,
    message: 'Too many requests from this client, Please try again later'
});
app.use(express_1.default.json({ limit: '10kb' }));
app.use((0, cookie_parser_1.default)());
app.use('/api', limiter);
// Data sanitization
app.use((0, express_mongo_sanitize_1.default)());
app.use((0, xss_clean_1.default)());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/', view_route_1.default);
app.use('/v1/auth', auth_route_1.default);
app.use('/api/v1/tour', tour_route_1.default);
app.use('/api/v1/reviews', review_route_1.default);
// Invalid route Handler
app.all('*', (req, res, next) => {
    next(new app_error_1.default(`Cannot find the url ${req.url}`, http_status_codes_1.StatusCodes.NOT_FOUND));
});
// Global Error Controller for all the errors.
app.use(global_error_handler_1.default);
exports.default = app;
