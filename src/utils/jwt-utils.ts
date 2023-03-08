/** @format */

import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { Request } from 'express';

export const signToken = (id: String, username: String) =>
    jwt.sign({ id, username }, `${process.env.JWT_SECRET}`, {
        expiresIn: process.env.JWT_EXPIRATION
    });

export const decode = async (token: string) =>
    jwt.verify(token, `${process.env.JWT_SECRET}`);

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
