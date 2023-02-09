const jwt = require('jsonwebtoken');
const { promisify } = require('util');

exports.signToken = (id, username) =>
    jwt.sign({ id, username }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION
    });

exports.decode = async (token) => await promisify(jwt.verify)(token, process.env.JWT_SECRET);

exports.getTokenFromHeader = (req) => {
    let jwtToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        jwtToken = req.headers.authorization.split(' ')[1];
    }
    return jwtToken;
};
