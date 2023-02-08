const cookieOption = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
    httpOnly: true
};

if (process.env.NODE_ENV === 'production') cookieOption.secure = true;

module.exports = cookieOption;
