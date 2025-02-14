/* eslint-disable no-process-env */
const userActivity = require('../../models/userActivity');
const Users = require('../../models/Users');
const errorLogger = require('../../../logger');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, MAIL_USERNAME, MAIL_PASSWORD, APP_URL } = require('../../config/envConfig');
const { createNotification } = require('../../common/notifications');
const roles = require('../../models/roles');
const { sendEmailForOfferExamType } = require('../../services/auth');

const userController = {
	getAllActivity: async (req, res) => {
		try {
			const userActivities = await userActivity.find().populate('userId');
			res.status(200).json({ status: true, data: userActivities });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	getAllUsers: async (req, res) => {
		try {
			const users = await Users.find({ status: { $in: ['active', 'inactive', 'blocked'] } }).populate('roleId').sort({ _id: -1 });

			res.status(200).json({ status: true, data: users });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	changeStatus: async (req, res) => {
		try {
			const { userId, newStatus } = req.body.data;

			if (!userId || !newStatus) {
				return res.status(400).json({ status: false, message: 'User ID and new status are required.' });
			}


			const user = await Users.findByIdAndUpdate(userId, { status: newStatus }, { new: true });

			if (!user) {
				return res.status(404).json({ status: false, message: 'User not found' });
			}
			try {
				const transporter = nodemailer.createTransport({
					service: 'gmail',
					auth: {
						user: MAIL_USERNAME,
						pass: MAIL_PASSWORD,
					},
				});

				const emailContent = `
					<p>Dear ${user.name},</p>
					<p>Your account status has been updated by the administrator.</p>
					<p><b>New Status:</b> ${newStatus}</p>
					<p>If you have any questions, please contact support.</p>
					<p>Best regards,<br>boiler plate</p>
				`;

				await transporter.sendMail({
					from: 'your_email@example.com',
					to: user.email,
					subject: 'Account Status Update',
					html: emailContent,
				});


			} catch (emailError) {
				console.error('Error sending email:', emailError);
			}

			res.status(200).json({
				status: true,
				message: `User status updated to ${newStatus}`,
				user: user,
			});

		} catch (error) {
			errorLogger(error);

			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},


	addUpdateUser: async (req, res) => {
		try {
			const userData = {
				name: req.body.name,
				email: req.body.email,
				status: req.body.status,
				roleId: req.body.roleId,
				createdBy: req.body.createdBy,
			};
			if (req.body.updateBy) {
				userData.updateBy = req.body.updateBy;
			}
			if (!userData.email) {
				return res.status(400).json({ status: false, message: 'Email is required' });
			}

			const isUpdate = req.body.updateBy;
			if (!isUpdate) {
				// Check if email already exists only for new user creation
				const existingUserByEmail = await Users.findOne({ email: userData.email });
				if (existingUserByEmail) {
					return res.status(400).json({ status: false, message: 'Email already exists' });
				}
			}

			const existingUser = await Users.findOne({ email: userData.email });


			if (existingUser) {
				const isStatusUpdated = existingUser.status !== userData.status;
				const isRoleUpdated = existingUser.roleId !== userData.roleId;

				if (!isStatusUpdated && !isRoleUpdated) {
					return res.status(200).json({ status: true, message: 'No updates were made to the user' });
				}

				// Update existing user
				Object.assign(existingUser, userData);
				const updatedUser = await existingUser.save();
				// Create update notification for the user
				const updateNotification = {
					notification: `Hello ${userData.name}, your account has been updated by Admin.`,
					type: 'update',
					notifyBy: req.body.createdBy,
					notifyTo: existingUser._id,
					createdAt: new Date(),
					url: '/user/dashboard', // Adjust as per the application
				};
				await createNotification(updateNotification);

				try {
					const transporter = nodemailer.createTransport({
						service: 'gmail',
						auth: {
							user: MAIL_USERNAME,
							pass: MAIL_PASSWORD,
						},
					});

					let emailContent = `<p>Dear ${userData.name},</p>`;
					let subject = '';

					if (isStatusUpdated && isRoleUpdated) {
						const newRoleData = await roles.findById(userData.roleId);
						const newRoleName = newRoleData ? newRoleData.roleName : 'Unknown';

						emailContent += `
							<p>Your account status and role have been updated by the administrator.</p>
							<p><b>Updated Status:</b> ${userData.status}</p>
							<p><b>Updated Role:</b> ${newRoleName}</p>
						`;
						subject = 'Your status and role have been updated';
					} else if (isStatusUpdated) {
						emailContent += `
							<p>Your account status has been updated by the administrator.</p>
							<p><b>Updated Status:</b> ${userData.status}</p>
						`;
						subject = 'Your status has been updated';
					} else if (isRoleUpdated) {
						const newRoleData = await roles.findById(userData.roleId);
						const newRoleName = newRoleData ? newRoleData.roleName : 'Unknown';

						emailContent += `
							<p>Your role has been updated by the administrator.</p>
							<p><b>Updated Role:</b> ${newRoleName}</p>
						`;
						subject = 'Your role has been updated';
					}

					if (subject) {
						emailContent += `
							<p>Please review your account to understand the changes.</p>
							<p>If you have any questions, feel free to reach out to the support team.</p>
							<p>The Team</p>
						`;

						await transporter.sendMail({
							from: 'your_email@example.com',
							to: userData.email,
							subject,
							html: emailContent,
						});
					}
				} catch (emailError) {
					console.error('Error sending email:', emailError);
					return res.status(500).json({ status: false, message: 'User updated but email sending failed' });
				}

				// Notification for update
				if (isRoleUpdated || isStatusUpdated) {
					const createNotificationMessage = {
						notification: `User "${userData.name}" has been updated successfully.`,
						type: 'update',
						notifyBy: req.body.createdBy,
						notifyTo: req.body.createdBy,
						createdAt: new Date(),
						url: '/admin/states',
					};
					createNotification(createNotificationMessage);
				}

				return res.status(200).json({ status: true, message: 'User updated successfully', data: updatedUser });
			} else {
				const newUser = new Users(userData);
				const updatedUser = await newUser.save();
				const savedUser = await newUser.save();
				const userId = newUser._id.toString();
				const resetToken = jwt.sign({ userId: userId }, JWT_SECRET, { expiresIn: '1h' });
				newUser.resetToken = resetToken;
				const resetUrl = `${APP_URL}/reset-password?userId=${userId}&token=${resetToken}`;

				try {
					const transporter = nodemailer.createTransport({
						service: 'gmail',
						auth: {
							user: MAIL_USERNAME,
							pass: MAIL_PASSWORD,
						},
					});

					await transporter.sendMail({
						from: 'your_email@example.com',
						to: userData.email,
						subject: 'User Added',
						html: `
							<p>Dear ${userData.name},</p>
							<p>Welcome to the platform! Your account has been created by the administrator.</p>
							<p>Please <a href="${resetUrl}">set up your password</a> to start using the system.</p>
						`,
					});
				} catch (emailError) {
					console.error('Error sending email:', emailError);
					return res.status(500).json({ status: false, message: 'User added but email sending failed' });
				}

				// Notification for new user addition
				const createNotificationMessage = {
					notification: `New user "${userData.name}" has been added successfully.`,
					type: 'add',
					notifyBy: req.body.createdBy,
					notifyTo: req.body.createdBy,
					createdAt: new Date(),
					url: '/admin/states',
				};
				createNotification(createNotificationMessage);

				// Create welcome notification for the new user
				const welcomeNotification = {
					notification: `Welcome ${userData.name}! Your account has been created successfully.`,
					type: 'welcome',
					notifyBy: req.body.createdBy,
					notifyTo: savedUser._id,
					createdAt: new Date(),
					url: '/user/dashboard', // Adjust as per the application
				};
				await createNotification(welcomeNotification);

				return res.status(200).json({ status: true, message: 'User added successfully', data: updatedUser });
			}
		} catch (error) {
			console.error('Error processing user operation:', error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	deleteUser: async (req, res) => {
		try {
			const ids = req.body.flat();
			const objectIdArray = ids.map((id) => new mongoose.Types.ObjectId(id));
			if (!objectIdArray) {
				return res.status(404).json({ message: 'User not found', status: false });
			}
			const data = await Users.deleteMany({ _id: { $in: objectIdArray } });
			const admins = await Users.findOne({ role: 'admin' });

			if (!admins) {
				return res.status(404).json({ status: false, message: 'Admin not found' });
			}

			const createNotificationMessage = {
				notification: `User  have been deleted successfully.`,
				// Adjust this to the admin's identifier
				type: 'deletion',
				notifyBy: admins._id,  // Corrected this line
				notifyTo: admins._id,  // Corrected this line
				createdAt: new Date(),
				url: '/admin/users',
			};


			createNotification(createNotificationMessage);

			res.status(200).json({
				success: true,
				message: 'User deleted successfully',
				data
			});
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ message: 'Internal Server Error' });
		}
	},
	sendEmail: async (req, res) => {
		try {
			const userIds = req.body.data;
			const users = await Users.find({ _id: { $in: userIds } })
			// const transporter = nodemailer.createTransport({
			// 	service: 'gmail',
			// 	auth: {
			// 		user: MAIL_USERNAME,
			// 		pass: MAIL_PASSWORD
			// 	}
			// });
			await sendEmailForOfferExamType(users)
			// const emailList = users.map(user => user.email)

			// const mailOptions = {
			// 	from: 'your-email@gmail.com',
			// 	to: emailList,
			// 	subject: 'hi testing',
			// 	text: 'hie ',
			// };

			// await transporter.sendMail(mailOptions);

			res.status(200).json({ status: true, message: 'Email sent successfully' });
		} catch (error) {
			console.log(error);
			res.status(500).json({ message: 'Failed to send email' });
		}
	}
};

module.exports = userController;
