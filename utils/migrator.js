const fs = require('fs');
const env = require('dotenv');
const mongoose = require('mongoose');

const Tour = require('../models/tour');
const User = require('../models/user');

env.config({ path: './config.env' });

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
    })
    .catch((error) => {
        console.error(`Error while connecting to Mongo DB ${error}`);
    });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/users.json`, 'utf-8'));

const importData = async () => {
    try {
        console.info(process.env);
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        console.info('DB migration complete !!');
        process.exit(0);
    } catch (e) {
        console.error(`Error while importing .... ${e}`);
        process.exit(1);
    }
};

const cleanDb = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        console.info('Clean database successfully');
        process.exit(0);
    } catch (e) {
        console.error(`Error while cleaning .... ${e}`);
        process.exit(1);
    }
};

if (process.argv[2] === 'import') {
    importData();
} else if (process.argv[2] === 'clean') {
    cleanDb();
}
