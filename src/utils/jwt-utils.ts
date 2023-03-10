/** @format */

import jwt, { Secret } from 'jsonwebtoken';
import { Request } from 'express';

const secret: Secret = `${process.env.JWT_SECRET}`;
export const signToken = (id: string, username: string) =>
    jwt.sign({ id, username }, secret, {
        expiresIn: process.env.JWT_EXPIRATION
    });

export const decode = (token: string) => jwt.verify(token, secret);

export const getTokenFromHeader = (req: Request) => {
    let jwtToken;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        jwtToken = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.authToken) {
        jwtToken = req.cookies.authToken;
    }
    return jwtToken;
};
