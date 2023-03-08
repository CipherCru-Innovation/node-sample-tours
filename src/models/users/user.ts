/** @format */

import IUser from '../user.model';
import crypto from 'crypto';
import validator from 'validator';
import * as bcrypt from 'bcryptjs';
import mongoose, { HydratedDocument, Model, Schema } from 'mongoose';
import { encryptPasswordOnSave } from './user-middleware';

export interface UserDocument extends IUser, Document {
    createPasswordResetToken(): void;
    matchPassword(
        candidatePassword: String,
        userPassword: String
    ): Promise<boolean>;
}

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'User name must be provided']
        },
        email: {
            type: String,
            required: [true, 'email must be provided'],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, 'Invalid email address.']
        },
        photo: {
            type: String,
            default: 'default.jpg'
        },
        role: {
            type: String,
            enum: ['user', 'guide', 'lead-guide', 'admin'],
            default: 'user'
        },
        password: {
            type: String,
            required: [true, 'Password cannot be empty'],
            minlength: 8,
            select: false
        },
        passwordConfirm: {
            type: String,
            required: [true, 'Confirm your password'],
            validate: {
                // This only works on CREATE and SAVE!!!
                validator: function (
                    this: HydratedDocument<IUser>,
                    el: String
                ) {
                    return el === this.password;
                },
                message: 'Password does not match.'
            }
        },
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        isActive: {
            type: Boolean,
            default: true,
            select: false
        }
    },
    /* 
    ================================================================
    Schema Options
    ================================================================
    */
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        id: false
    }
);

/*
================================================================
Virtual properties
****************************************************************
Use a regular function when we need to use the this keyword
TODO: populate virtual properties on filter query
****************************************************************
================================================================
*/

/*
================================================================
Indexes
****************************************************************
================================================================
*/

userSchema.index({
    passwordResetToken: 1,
    passwordResetExpires: -1,
    password: 1
});

// MiddleWare Declaration
userSchema.pre<IUser>('save', encryptPasswordOnSave);

userSchema.methods.matchPassword = async function (
    candidatePassword: string,
    userPassword: string
) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (
    this: HydratedDocument<IUser>,
    JWTTimestamp: Number
) {
    if (this.passwordChangedAt) {
        const changedTimestamp = this.passwordChangedAt.getTime() / 1000;

        return JWTTimestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // console.log({ resetToken }, this.passwordResetToken);

    this.passwordResetExpires = Date.now() + 8 * 60 * 60 * 1000;

    return resetToken;
};

export default mongoose.model<UserDocument>('User', userSchema);
