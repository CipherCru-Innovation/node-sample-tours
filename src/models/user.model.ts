/** @format */

import { Document, Schema } from 'mongoose';

interface IUser {
    _id: string;
    name?: String;
    email: String;
    photo?: String;
    role: String;
    password: String;
    passwordConfirm?: String;
    passwordChangedAt?: Date;
    passwordResetToken?: String;
    passwordResetExpires?: Date;
    isActive: Boolean;
}

export default IUser;
