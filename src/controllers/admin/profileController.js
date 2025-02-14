const User = require('../../models/Users');
const errorLogger = require('../../../logger');
const { createUpload } = require('../../utils/multerConfig');
const bcrypt = require('bcrypt');
const { createNotification } = require('../../common/notifications');

const profileController = {
	updateProfileDetails: async (req, res) => {

		console.log("hello profile image")
		try {
			const upload = createUpload('userImage');
			await upload.single('image')(req, res, async (err) => {
				if (err) {
					errorLogger('Error uploading image:', err);
					return res.status(500).json({ status: false, message: 'Error uploading image' });
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

						const AdminNotificationData = {
							notification: 'Profile has been updated successfully',
							notifyBy: req.body.userId,
							notifyTo: req.body.userId,
							type: 'profile update',
							url: '/admin/edit-profile' // Updated URL as requested
						};

						await createNotification(AdminNotificationData);
						return res.status(200).json({
							status: true,
							message: 'Profile has been updated successfully',
							brand: existingUser
						});
					} catch (error) {
						errorLogger('Error updating profile:', error);
						return res.status(500).json({ status: false, message: 'Internal Server Error' });
					}
				} catch (error) {
					errorLogger('Error processing profile data:', error);
					return res.status(500).json({ status: false, message: 'Internal Server Error' });
				}
			});
		} catch (error) {
			errorLogger('Error handling profile update:', error);
			return res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},
	updatePassword: async (req, res) => {
		try {
			const id = req.params.id;
			const { currentPassword, newPassword } = req.body;

			const user = await User.findById(id);

			if (!user) {
				return res.status(404).json({ message: 'User not found', status: false });
			}

			const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);

			if (!isPasswordMatch) {
				return res.status(400).json({ message: 'Current password not matched', status: false });
			}

			const hashedPassword = await bcrypt.hash(newPassword, 10);

			user.password = hashedPassword;
			await user.save();

			const userNotificationData = {
				notification: `Hi  <strong>${user.name}</strong> Your password has been updated successfully. `, // Customize the notification message as needed
				notifyBy: user._id, // Assuming the user ID is used for notification
				notifyTo: user._id, // Notify the user who updated their profile
				type: 'profile_update',
				url: '/user/edit-profile' // Optional URL to include in the notification
			};

			createNotification(userNotificationData);

			res.json({ message: 'Password updated successfully', status: true });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ message: 'Internal Server Error' });
		}
	}
};

module.exports = profileController;
