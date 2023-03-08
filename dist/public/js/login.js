"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = void 0;
/* eslint-disable */
const axios_1 = __importDefault(require("axios"));
const alert_1 = require("./alert");
const login = async (email, password) => {
    try {
        const res = await (0, axios_1.default)({
            method: 'POST',
            url: 'http://127.0.0.1:3000/v1/auth/login',
            data: {
                username: email,
                password
            }
        });
        if (res.data.status === 'SUCCESS') {
            (0, alert_1.showAlert)('SUCCESS', 'Logged in successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 750);
        }
    }
    catch (error) {
        (0, alert_1.showAlert)('ERROR', error.response.data.message);
    }
};
exports.login = login;
const logout = async () => {
    try {
        const res = await (0, axios_1.default)({
            method: 'GET',
            url: 'http://127.0.0.1:3000/v1/auth/logout'
        });
        if (res.data.status === 'SUCCESS') {
            (0, alert_1.showAlert)('SUCCESS', 'Logged out successfully');
            window.setTimeout(() => {
                location.assign('/');
            }, 750);
        }
    }
    catch (error) {
        (0, alert_1.showAlert)('ERROR', error.response.data.message);
    }
};
exports.logout = logout;
