const { RESPONSE_STATUS } = require('../utils/constants/app-constants');

exports.sendSuccess = (res, code, data, options) =>
    res.status(code).json({
        status: RESPONSE_STATUS.SUCESS,
        data,
        ...options
    });

exports.sendError = (res, code, message, options) => {
    if (`${code}`.startsWith('4')) this.status = RESPONSE_STATUS.FAILURE;
    else this.status = RESPONSE_STATUS.ERROR;
    if (!message) message = 'Something went wrong !!';

    res.status(code).json({
        status: this.status,
        message,
        ...options
    });
};
