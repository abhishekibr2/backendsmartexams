const mongoose = require('mongoose');
const { MONGODB_URL } = require('../config/envConfig');

const connectDB = async () => {
	try {
		const connection = await mongoose.connect(MONGODB_URL, {
			serverSelectionTimeoutMS: 5000
		});

		console.log(`MongoDB Connected: ${connection.connection.host}`);
	} catch (error) {
		throw new Error('Unable to connect to MongoDB');
	}
};

module.exports = connectDB;
