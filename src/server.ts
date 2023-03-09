/** @format */

import { ConnectOptions } from 'mongoose';
import { initMongo } from './dbconfig';
import { initConfig } from './env.config';

initConfig();
initMongo();
const app = require('./app');

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
