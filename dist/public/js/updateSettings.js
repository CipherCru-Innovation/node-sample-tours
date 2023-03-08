"use strict";
/**
 * eslint-disable
 *
 * @format
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateData = void 0;
const axios_1 = __importDefault(require("axios"));
const alert_1 = require("./alert");
// type is either password or data
const updateData = async (data, type) => {
    try {
        let url;
        if (type === 'password') {
            url = 'http://127.0.0.1:3000/v1/auth/profile/update-password';
        }
        else {
            url = 'http://127.0.0.1:3000/v1/auth/profile';
        }
        const res = await (0, axios_1.default)({
            method: 'PATCH',
            url,
            data
        });
        if (res.data.status === 'SUCCESS') {
            (0, alert_1.showAlert)('SUCCESS', 'Updated Successfully!!');
            window.setTimeout(() => {
                location.assign('/profile');
            }, 750);
        }
    }
    catch (error) {
        (0, alert_1.showAlert)('ERROR', error.response.data.message);
    }
};
exports.updateData = updateData;
