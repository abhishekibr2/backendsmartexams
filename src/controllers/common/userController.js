const User = require('../../models/Users');
const Role = require('../../models/roles');
// eslint-disable-next-line import/no-extraneous-dependencies
const asyncHandler = require('express-async-handler');
const errorLogger = require('../../../logger');

const chatController = {
	allUsers: asyncHandler(async (req, res) => {
		const keyword = req.query.search
			? {
					$or: [
						{ name: { $regex: req.query.search, $options: 'i' } },
						{ email: { $regex: req.query.search, $options: 'i' } }
					]
				}
			: {};

		const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
		res.send(users);
	}),

	getAllUsers: async (req, res) => {
		try {
			const users = await User.find({ status: 'active' }).select('_id name email image');
			res.status(200).json({ status: true, data: users });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	allRoles: async (req, res) => {
		try {
			const roles = await Role.find({ status: { $in: ['active', 'inactive'] } }).sort({ _id: -1 });
			res.status(200).json({ status: true, data: roles });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	}
};

module.exports = chatController;
