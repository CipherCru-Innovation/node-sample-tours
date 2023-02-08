const { RESPONSE_STATUS } = require('../utils/constants/app-constants');

class AppError extends Error {
    constructor(message, statusCode, isError) {
        super(message);

        this.statusCode = statusCode;
        this.status = !isError ? RESPONSE_STATUS.FAILURE : RESPONSE_STATUS.ERROR;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
