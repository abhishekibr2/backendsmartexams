const User = require('../../models/Users');
const errorLogger = require('../../../logger');
const { createUpload } = require('../../utils/multerConfig');
const bcrypt = require('bcrypt');
const { createNotification } = require('../../common/notifications');

const profileController = {

	updateProfileDetails: async (req, res) => {
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
						dob: req.body.dob,
						fatherName: req.body.fatherName,
						phoneNumber: req.body.phoneNumber,
						course: req.body.course,
						referCode: req.body.referCode,


						address: {
							city: req.body.city,
							state: req.body.state
						},
						image: req.file && req.file.filename ? req.file.filename : req.body.image || null
					};

					try {
						const existingUser = await User.findByIdAndUpdate(req.body.userId, profileData, { new: true });

						const StudentNotificationData = {
							notification: 'Profile has been updated successfully',
							notifyBy: req.body.userId,
							notifyTo: req.body.userId,
							type: 'profile update',
						};

						await createNotification(StudentNotificationData);
						return res.status(200).json({
							status: true,
							message: 'Profile has been updated successfully',
							user: existingUser
						});
					} catch (error) {
						console.log(error, 'student')
						errorLogger('Error updating profile:', error);
						return res.status(500).json({ status: false, message: 'Internal Server Error' });
					}
				} catch (error) {
					errorLogger('Error processing profile data:', error);
					return res.status(500).json({ status: false, message: 'Internal Server Error' });
				}
			});
		} catch (error) {
			console.log(error, "error")
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
				return res.status(400).json({ message: 'Old password not matched', status: false });
			}
			const hashedPassword = await bcrypt.hash(newPassword, 10);
			user.password = hashedPassword;
			await user.save();
			const userNotificationData = {
				notification: `Hi  <strong>${user.name}</strong> Your password has been updated successfully. `,
				notifyBy: user._id,
				notifyTo: user._id,
				type: 'profile_update',
				url: '/student/my-profile'
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
