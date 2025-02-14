const User = require('../../models/Users');
const userDocuments = require('../../models/userDocuments');
const errorLogger = require('../../../logger');
const { createUpload } = require('../../utils/multerConfig');
const bcrypt = require('bcrypt');
const { createNotification } = require('../../common/notifications');
const { trackUserActivity } = require('../../common/functions');

const profileController = {
	updateProfileDetails: async (req, res) => {
		try {
			const upload = createUpload('userImage');
			upload.single('image')(req, res, async (err) => {
				if (err) {
					errorLogger('Error uploading logo:', err);
					return res.status(500).json({ message: 'Error uploading logo', status: false });
				}

				try {
					const profileData = {
						name: req.body.name,
						email: req.body.email,
						phoneNumber: req.body.phoneNumber,
						address: {
							country: req.body.country,
							state: req.body.state
						},
						image: req.file && req.file.filename ? req.file.filename : req.body.image || null
					};

					try {
						const existingUser = await User.findByIdAndUpdate(req.body.userId, profileData, { new: true });
						await trackUserActivity(req.body.userId, `Profile updated by ${req.body.name}`);
						const UserNotificationData = {
							notification: 'Profile has been updated successfully',
							notifyBy: req.body.userId,
							notifyTo: req.body.userId,
							type: 'profile update',
							url: '/user/edit-profile'
						};
						createNotification(UserNotificationData);
						return res.status(200).json({
							status: true,
							message: 'Profile has been updated successfully',
							brand: existingUser
						});
					} catch (error) {
						errorLogger('Error updating brand:', error);
						return res.status(500).json({ status: false, message: 'Internal Server Error' });
					}
				} catch (error) {
					errorLogger(error);
					return res.status(500).json({ status: false, message: 'Internal Server Error' });
				}
			});
		} catch (error) {
			errorLogger(error);
			return res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},
	updatePassword: async (req, res) => {
		try {
			const id = req.params.id;
			const { currentPassword, newPassword } = req.body;

			const user = await User.findById(id).populate('roleId');

			if (!user) {
				return res.status(404).json({ message: 'User not found', status: false });
			}

			const isPreviousPassword = await bcrypt.compare(newPassword, user.password);

			if (isPreviousPassword) {
				return res
					.status(400)
					.json({ message: 'New password cannot be the same as the previous one', status: false });
			}
			if (user.loginType === 'social') {
				if (user.loginType === 'social' && currentPassword) {
					const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
					if (!isPasswordMatch) {
						return res.status(400).json({ message: 'Current password not matched', status: false });
					}
					const hashedPassword = await bcrypt.hash(newPassword, 10);

					user.password = hashedPassword;
					await user.save();
				} else {
					const hashedPassword = await bcrypt.hash(newPassword, 10);
					user.password = hashedPassword;
					await user.save();
					return res.status(200).json({ message: 'Password updated successfully', status: true });
				}
			}

			const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);

			if (!isPasswordMatch) {
				return res.status(400).json({ message: 'Current password not matched', status: false });
			}

			const hashedPassword = await bcrypt.hash(newPassword, 10);

			user.password = hashedPassword;
			await user.save();

			const userNotificationData = {
				notification: `Hi  <strong>${user.name}</strong> Your password has been updated successfully.`, // Customize the notification message as needed
				notifyBy: user._id, // Assuming the user ID is used for notification
				notifyTo: user._id, // Notify the user who updated their profile
				type: 'profile_update',
				url: `/${user.roleId.roleName}/edit-profile` // Optional URL to include in the notification
			};

			createNotification(userNotificationData);
			await trackUserActivity(id, `Password updated by ${user.name}`);
			res.json({ message: 'Password updated successfully', status: true });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ message: 'Internal Server Error' });
		}
	},

	uploadIdentityDocuments: async (req, res) => {
		try {
			const upload = createUpload('userDocuments');
			await upload.multiple('images-1')(req, res, async (err) => {
				if (err) {
					errorLogger('Error uploading images:', err);
					return res.status(500).json({ message: 'Error uploading images', error: err });
				}

				const { documentType, userId } = req.body;
				const files = req.files;
				const newDocuments = files.map((file) => ({
					imagePath: file.filename,
					name: file.originalname,
					type: documentType
				}));

				try {
					let documents = await userDocuments.findOne({ userId: userId });
					if (!documents) {
						documents = new userDocuments({ userId: userId });
					}
					documents.documents = (documents.documents || []).concat(newDocuments);
					await documents.save();
					await trackUserActivity(userId, 'Identity documents uploaded');

					res.status(200).json({ status: true, message: 'Documents have been uploaded successfully' });
				} catch (error) {
					errorLogger('Error adding room details:', error);
					res.status(500).json({ message: 'Error adding room details', error });
				}
			});
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ message: 'Internal Server Error' });
		}
	},

	getUserDocuments: async (req, res) => {
		try {
			const { userId } = req.body;
			const documents = await userDocuments.findOne({ userId: userId });
			res.status(200).json({ status: true, data: documents });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ message: 'Internal Server Error' });
		}
	},
	deleteUserDocument: async (req, res) => {
		try {
			const { userId, documentId } = req.body;
			const documents = await userDocuments.findOne({ userId: userId });
			if (!documents) {
				return res.status(404).json({ message: 'Documents not found', status: false });
			}
			const deletedDocument = await userDocuments.updateOne(
				{ userId },
				{ $pull: { documents: { _id: documentId } } }
			);

			if (deletedDocument.nModified === 0) {
				return res.status(404).json({ message: 'Document not found', status: false });
			}
			await trackUserActivity(userId, 'User account deleted');

			res.status(200).json({ status: true, message: 'Document deleted successfully' });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ message: 'Internal Server Error' });
		}
	},
	uploadDigitalSignature: async (req, res) => {
		try {
			const { userId, sign } = req.body;
			let documents = await userDocuments.findOne({ userId: userId });
			if (!documents) {
				documents = new userDocuments({ userId: userId, digitalSignature: sign });
			} else {
				documents.digitalSignature = sign;
			}
			await documents.save();
			await trackUserActivity(userId, 'Digital signature uploaded');

			const user = await User.findById(userId).populate('roleId');
			const notificationData = {
				notification: `Your signature uploaded successfully! `,
				notifyBy: userId,
				notifyTo: userId,
				type: 'digital_signature_upload',
				url: `/${user.roleId.roleName}/edit-profile`
			};

			await createNotification(notificationData);
			res.status(200).json({ status: true, message: 'Digital signature uploaded successfully' });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ message: 'Internal Server Error' });
		}
	},

	lastSeenUser: async (req, res) => {
		try {
			const userId = req.params.id;
			if (!userId) {
				return res.status(404).json({ message: 'User not found', status: false });
			}
			const lastSeen = new Date().toISOString();

			const user = await User.findByIdAndUpdate(userId, { lastSeen: lastSeen }, { new: true });
			const data = user.lastSeen;

			res.status(200).json({ status: true, message: 'last seen user', lastSeenData: data });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ message: 'Internal Server Error' });
		}
	}
};

module.exports = profileController;
