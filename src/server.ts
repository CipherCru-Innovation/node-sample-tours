/** @format */

import { Connection, ConnectOptions } from 'mongoose';

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: './config.env' });

const app = require('./app');

mongoose.set('strictQuery', false);

const connectionOptions: ConnectOptions = {
    autoIndex: true,
    autoCreate: true,
    dbName: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    pass: process.env.DB_PASSWORD
};

mongoose
    .connect(process.env.DB_URL, connectionOptions)
    .then((connection: any) => {
        console.warn(`Connection established ${connection}`);
    });

const SERVER_PORT = process.env.SERVER_PORT || 8000;

const server = app.listen(SERVER_PORT, () => {
    console.info(`App is Running on port ${SERVER_PORT}...!!⭐⭐⭐`);
});

// Unhandled Rejections Event
process.on('unhandledRejection', (err) => {
    console.error(err, `\n..... Exiting`);
    server.close(() => process.exit(1));
});

/* 
Need to exit on any uncaught exceptions got missed the safety net of the application.
Since the whole process is in unclean state now.Mostly Express will handle these errors withing if occurred. 
This handler is act as a wrapper in cases missed exceptions.
*/

process.on('uncaughtException', (err) => {
    console.error(err, `\n..... Exiting`);
    server.close(() => process.exit(1));
});
