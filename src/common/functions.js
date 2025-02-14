const mongoose = require('mongoose');
const userActivity = require('../models/userActivity');
const logError = require('../../logger');

async function getModelByName(modelName) {
	const modelNames = mongoose.modelNames();
	if (!modelNames.includes(modelName)) {
		throw new Error(`Model ${modelName} not found`);
	}
	return mongoose.model(modelName);
}

async function getAdminDataByRole(modelName) {
	const Model = await getModelByName(modelName);
	const admin = await Model.findOne({ role: 'admin' });
	if (!admin) {
		throw new Error('No admin found');
	}
	return admin._id;
}

async function getAdminEmailByRole(modelName) {
	const Model = await getModelByName(modelName);
	const admin = await Model.findOne({ role: 'admin' });
	if (!admin) {
		throw new Error('No admin found');
	}
	return admin.email;
}

const trackUserActivity = async (userId, message) => {
	try {
		const activity = new userActivity({
			userId: userId,
			activityMessage: message
		});
		await activity.save();
	} catch (error) {
		logError(error);
	}
};

const getAllUserActivities = async (userId) => {
	try {
		return await userActivity.find({ userId: userId }).sort({ datetime: -1 });
	} catch (error) {
		logError(error);
		return [];
	}
};

module.exports = {
	getAdminEmailByRole,
	getAdminDataByRole,
	trackUserActivity,
	getAllUserActivities
};
