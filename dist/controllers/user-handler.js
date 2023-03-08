"use strict";
/** @format */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = exports.deleteMe = exports.updateMe = exports.resizeUserPhoto = exports.uploadUserPhoto = void 0;
const http_status_codes_1 = require("http-status-codes");
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const user_1 = __importDefault(require("../models/users/user"));
const app_error_1 = __importDefault(require("../exceptions/app-error"));
const catch_async_1 = __importDefault(require("../utils/catch-async"));
const dataFactory = __importStar(require("../factory/data-handler-factory"));
const response_handler_1 = require("../factory/response-handler");
const multerStorage = multer_1.default.memoryStorage();
const multerFilter = (req, file, callback) => {
    console.info(file);
    if (file.mimetype.startsWith('image'))
        callback(null, true);
    else
        callback(new app_error_1.default('Invalid Image Format', http_status_codes_1.StatusCodes.BAD_REQUEST), false);
};
const upload = (0, multer_1.default)({
    storage: multerStorage,
    fileFilter: multerFilter
});
exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = (0, catch_async_1.default)(async (req, res, next) => {
    if (!req.file)
        return next();
    req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;
    await (0, sharp_1.default)(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/images/users/${req.file.filename}`);
    return next();
});
const sanitizeUserBody = (data, ...fields) => {
    const sanitized = {};
    Object.keys(data).forEach((field) => {
        if (fields.includes(field))
            sanitized[field] = data[field];
    });
    return sanitized;
};
exports.updateMe = (0, catch_async_1.default)(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm)
        return next(new app_error_1.default('Can not update the password with this request', http_status_codes_1.StatusCodes.BAD_REQUEST));
    const updateOptions = sanitizeUserBody(req.body, 'name', 'email', 'profile');
    if (req.file)
        updateOptions.photo = req.file.filename;
    // update the user document with the given id
    const user = await user_1.default.findByIdAndUpdate(req.user._id, updateOptions, {
        new: true,
        runValidators: true
    });
    if (!user) {
        // since the id is derived from the jwt token. The user must exist already and should be a valid one.
        return next(new app_error_1.default('Something went wrong while updating the user details', http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR));
    }
    return (0, response_handler_1.sendSuccess)(res, http_status_codes_1.StatusCodes.OK, user);
});
exports.deleteMe = (0, catch_async_1.default)(async (req, res, next) => {
    const user = await user_1.default.findByIdAndUpdate(req.user._id, { active: false }, {
        new: true,
        runValidators: true
    });
    if (!user) {
        // since the id is derived from the jwt token. The user must exist already and should be a valid one.
        return next(new app_error_1.default('Something went wrong while updating the user details', http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR));
    }
    return (0, response_handler_1.sendSuccess)(res, http_status_codes_1.StatusCodes.NO_CONTENT);
});
exports.getUser = dataFactory.getById(user_1.default);
