const jwtUtils = require('./jwt-utils');
const cookieOption = require('./constants/cookieOptions');
const { sendSuccess } = require('../factory/reponse-handler');

exports.createAndSendToken = (user, statusCode, res, message) => {
    const token = jwtUtils.signToken(user._id, user.username);

    res.cookie('authToken', cookieOption);
    sendSuccess(res, statusCode, { user }, { message, token });
};
