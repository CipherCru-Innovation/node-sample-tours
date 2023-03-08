"use strict";
/** @format */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenFromHeader = exports.decode = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signToken = (id, username) => jsonwebtoken_1.default.sign({ id, username }, `${process.env.JWT_SECRET}`, {
    expiresIn: process.env.JWT_EXPIRATION
});
exports.signToken = signToken;
const decode = async (token) => jsonwebtoken_1.default.verify(token, `${process.env.JWT_SECRET}`);
exports.decode = decode;
const getTokenFromHeader = (req) => {
    let jwtToken;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        jwtToken = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies.authToken) {
        jwtToken = req.cookies.authToken;
    }
    return jwtToken;
};
exports.getTokenFromHeader = getTokenFromHeader;
