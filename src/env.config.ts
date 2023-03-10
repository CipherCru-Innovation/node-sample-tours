/** @format */

import dotenv from 'dotenv';

export const initConfig = () => {
    if (process.env.NODE_ENV === 'prod') {
        dotenv.config({ path: 'config-prod.env' });
    } else if (process.env.NODE_ENV === 'dev') {
        dotenv.config({ path: 'config-dev.env' });
    } else {
        dotenv.config({ path: './config.env' });
    }
};
