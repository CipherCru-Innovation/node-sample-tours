const jwtUtils = require('./jwtUtils');
const cookieOption = require('./constants/cookieOptions');

exports.createAndSendToken = (user, statusCode, res, message) => {
    const token = jwtUtils.signToken(user._id, user.username);

    res.cookie('authToken', cookieOption);
    res.status(statusCode).send({
        status: 'SUCCESS',
        token,
        message,
        data: { user }
    });
};
