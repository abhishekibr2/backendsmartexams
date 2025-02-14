const nodemailer = require('nodemailer');
const EmailTemplate = require('../models/emailTemplate');
const AdminSetting = require('../models/adminSettings');
const ejs = require('ejs');
const path = require('path');
const logError = require('../../logger');
const { getAdminDataByRole } = require('../common/functions');
const createSafeRegex = require('../helper/createSafeRegex');
const { MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM_ADDRESS } = require('../config/envConfig');

const sendEmail = async (user, templateType, extraPlaceholders = {}) => {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: MAIL_USERNAME,
			pass: MAIL_PASSWORD
		}
	});

	try {
		const emailTemplate = await EmailTemplate.findOne({ type: templateType });

		if (!emailTemplate) {
			throw new Error('Email template not found');
		}

		const adminId = await getAdminDataByRole('users');
		const adminSetting = await AdminSetting.findOne({ userId: adminId });

		// Check if adminSetting is null and handle it
		if (!adminSetting) {
			console.warn('Admin settings not found, using default email signature.');
		}
		const emailSignature = adminSetting ? adminSetting.emailSignature : '';

		// Replace placeholders in the email template
		let emailContent = emailTemplate.template
			.replace(/\*\|Name\|\*/g, user.name)
			.replace(/\*\|Email\|\*/g, user.email)
			.replace(/\*\|Phone\|\*/g, user.phoneNumber);

		// Replace additional placeholders
		for (const [key, value] of Object.entries(extraPlaceholders)) {
			const regex = createSafeRegex(key, 'g');
			emailContent = emailContent.replace(regex, value);
		}

		// Render the final HTML content
		const templatePath = path.resolve(__dirname, '../', 'views/emails', 'dynamicTemplate.ejs');
		const title = emailTemplate.subject;
		const htmlContent = await ejs.renderFile(templatePath, { emailContent, emailSignature, title });

		const mailOptions = {
			from: MAIL_FROM_ADDRESS,
			to: user.email,
			subject: emailTemplate.subject,
			html: htmlContent
		};

		await transporter.sendMail(mailOptions);
	} catch (error) {
		logError(error);
		console.error('Error sending email:', error);
	}
};


const newAccountEmail = async (user) => {
	await sendEmail(user, 'registration');
};

const resetPasswordEmail = async (user, resetUrl) => {
	await sendEmail(user, 'resetPassword', { ResetLink: resetUrl });
};

const passwordConfirmationEmail = async (user) => {
	await sendEmail(user, 'password-confirmation');
};
// send Email for offer
const sendEmailForOfferExamType = async (user) => {
	let emailSubject = await EmailTemplate.findOne({ _id: '67948b8a2efceb504e07b372' });
	const userData = user.reduce((acc, item) => {
		acc[item.id] = item;
		return acc;
	}, {});
	Object.values(userData).forEach(async (userItem) => {
		await sendEmail(userItem, emailSubject.type);
	});
};

module.exports = {
	newAccountEmail,
	resetPasswordEmail,
	passwordConfirmationEmail,
	sendEmailForOfferExamType
};
