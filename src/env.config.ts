/** @format */

import dotenv from 'dotenv';

export const initConfig = () => {
    if (process.env.NODE_ENV === 'prod') {
        dotenv.config({ path: 'config-prod.env' });
    } else if (process.env.NODE_ENV === 'dev') {
        console.log('Setting Dev env');
        dotenv.config({ path: 'config-dev.env' });
    } else {
        console.log('--- Here');
        dotenv.config({ path: './config.env' });
    }
};
