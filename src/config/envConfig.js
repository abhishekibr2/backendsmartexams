/* eslint-disable no-process-env */
const path = require('path');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

// Load and expand environment variables
const envPath = path.resolve(__dirname, '../../../.env'); // Path to .env file
const envConfig = dotenv.config({ path: envPath });
dotenvExpand.expand(envConfig);

module.exports = {
	TEST: 'AVI',
	MONGODB_URL: process.env.MONGODB_URL,
	PORT: process.env.PORT,
	JWT_SECRET: process.env.JWT_SECRET,
	NODE_ENV: process.env.NODE_ENV,
	MAIL_USERNAME: process.env.MAIL_USERNAME,
	MAIL_PASSWORD: process.env.MAIL_PASSWORD,
	MAIL_FROM_ADDRESS: process.env.MAIL_FROM_ADDRESS,
	APP_URL: process.env.APP_URL,
	FILE_MANAGER_IS_PUBLIC: process.env.FILE_MANAGER_IS_PUBLIC,
	API_URL: process.env.API_URL,
	STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
	VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
	VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
	ZOOM_CLIENT_ID: process.env.ZOOM_CLIENT_ID,
	ZOOM_SECRET_ID: process.env.ZOOM_SECRET_ID,
	FRONTEND_DOMAIN: process.env.FRONTEND_DOMAIN
};
