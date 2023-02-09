const env = require('dotenv');
const mongoose = require('mongoose');

env.config({ path: './config.env' });

const app = require('./app');

mongoose.set('strictQuery', false);
mongoose
    .connect(process.env.DB_URL, {
        autoIndex: true,
        autoCreate: true,
        useNewUrlParser: true,
        user: process.env.DB_USERNAME,
        pass: process.env.DB_PASSWORD,
        useUnifiedTopology: true,
        dbName: process.env.DB_NAME || 'natours_dev'
    })
    .then((connection) => {
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
Since the whole process is in unclean state now.Moslty Express will handle these errors withing if occurred. 
This handler is act as a wrapper in casse missed exceptions.
*/

process.on('uncaughtException', (err) => {
    console.error(err, `\n..... Exiting`);
    server.close(() => process.exit(1));
});
