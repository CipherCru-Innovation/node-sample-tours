/** @format */
import { CookieOptions } from 'express';

const options: CookieOptions = {
    httpOnly: true,
    sameSite: 'lax'
};

const cookieOption = (
    expiryInMilliseconds?: Number,
    secure?: boolean
): CookieOptions => {
    if (expiryInMilliseconds)
        options.expires = new Date(Date.now() + expiryInMilliseconds.valueOf());
    else options.expires = new Date(Date.now() - 1000);
    if (secure) options.secure = true;
    else options.secure = false;

    if (process.env.NODE_ENV === 'prod') {
        options.secure = true;
        options.sameSite = 'none';
    }

    return options;
};

export default cookieOption;
