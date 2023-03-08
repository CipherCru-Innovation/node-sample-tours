/** @format */

export {};

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV?: 'dev' | 'prod' | 'test';
            SERVER_PORT: number;
            DB_URL: string;
            DB_PASSWORD: string;
            DB_USERNAME: string;
            DB_NAME: string;
            JWT_SECRET: string;
            JWT_EXPIRATION: string;
            JWT_COOKIE_EXPIRES: number;
            RESET_TOKEN_EXPIRY_SECONDS: number;
            RATE_LIMIT: number;
            RATE_LIMIT_WINDOW_MS: number;
            // Email Configurations
            SMTP_HOST: string;
            SMTP_PORT: number;
            SMTP_USERNAME: string;
            SMTP_PASSWORD: string;
        }
    }
}
