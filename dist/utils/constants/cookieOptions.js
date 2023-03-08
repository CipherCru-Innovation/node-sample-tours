"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options = {
    httpOnly: true,
    sameSite: 'lax'
};
const cookieOption = (expiryInMilliseconds, secure) => {
    if (expiryInMilliseconds)
        options.expires = new Date(Date.now() + expiryInMilliseconds.valueOf());
    else
        options.expires = new Date(Date.now() - 1000);
    if (secure)
        options.secure = true;
    else
        options.secure = false;
    if (process.env.NODE_ENV === 'prod') {
        options.secure = true;
        options.sameSite = 'none';
    }
    return options;
};
exports.default = cookieOption;
