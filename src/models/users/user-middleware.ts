/** @format */

import * as bcrypt from 'bcryptjs';
import {
    CallbackWithoutResultAndOptionalError,
    PreSaveMiddlewareFunction
} from 'mongoose';
import IUser from '../user.model';

export const encryptPasswordOnSave: PreSaveMiddlewareFunction<IUser> =
    async function (this: any, next: CallbackWithoutResultAndOptionalError) {
        // Only run this function if password was actually modified
        if (!this.isModified('password')) return next();

        // Hash the password with cost of 12
        this.password = await bcrypt.hash(this.password, 12);
        // Delete passwordConfirm field
        this.passwordConfirm = undefined;

        // Update the passowrd change timesptamp if the document is updated with the password field
        if (this.isModified('password') || !this.isNew)
            this.passwordChangedAt = new Date(Date.now() - 1000);

        return next();
    };

// export const findOnlyActive = function (
//     this: HydratedDocument<IUser>,
//     next: NextFunction
// ) {
//     // this points to the current query
//     this.find({ active: { $ne: false } });
//     return next();
// };
