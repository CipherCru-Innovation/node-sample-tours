/** @format */

import { Document } from 'mongoose';

interface IUser extends Document {
    _id: string;
    name?: string;
    email: string;
    photo?: string;
    role: string;
    password: string;
    passwordConfirm?: string;
    passwordChangedAt?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    isActive: Boolean;
}

export default IUser;
