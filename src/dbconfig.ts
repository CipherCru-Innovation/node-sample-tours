/** @format */

import { ConnectOptions } from 'mongoose';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

export const initMongo = () => {
    mongoose.set('strictQuery', true);
    mongoose.set('strict', true);
    const connectionOptions: ConnectOptions = {
        autoIndex: true,
        autoCreate: true,
        dbName: process.env.DB_NAME,
        user: process.env.DB_USERNAME,
        pass: process.env.DB_PASSWORD
    };

    mongoose.connect(process.env.DB_URL, connectionOptions);
};
