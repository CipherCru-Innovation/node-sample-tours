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
exports.logoutUser = exports.createAndSendToken = void 0;
const http_status_codes_1 = require("http-status-codes");
const jwtUtils = __importStar(require("./jwt-utils"));
const cookieOptions_1 = __importDefault(require("./constants/cookieOptions"));
const response_handler_1 = require("../factory/response-handler");
const createAndSendToken = (user, statusCode, res, message) => {
    const token = jwtUtils.signToken(user._id, user.email);
    res.cookie('authToken', token, (0, cookieOptions_1.default)(24 * 60 * 60 * 1000));
    return (0, response_handler_1.sendSuccess)(res, statusCode, { user }, { message, token });
};
exports.createAndSendToken = createAndSendToken;
const logoutUser = (req, res) => {
    const token = jwtUtils.getTokenFromHeader(req);
    res.cookie('authToken', token, (0, cookieOptions_1.default)());
    return (0, response_handler_1.sendSuccess)(res, http_status_codes_1.StatusCodes.OK);
};
exports.logoutUser = logoutUser;
