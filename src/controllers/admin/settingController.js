const Settings = require('../../models/adminSettings');
const EmailTemplate = require('../../models/emailTemplate');
const HeaderMenu = require('../../models/headerMenu');
const FooterMenu = require('../../models/footerMenu');
const errorLogger = require('../../../logger');
const { createUpload } = require('../../utils/multerConfig');
const { promisify } = require('util');
const fs = require('fs');
const unlinkAsync = promisify(fs.unlink);
const path = require('path');
const { getAdminDataByRole, trackUserActivity } = require('../../common/functions');
const Forum = require('../../models/forums');
const ForumViewCount = require('../../models/ForumViewCount');
const unlinkImage = require('../../utils/unlinkImage');

const settingController = {
	updateBrandDetails: async (req, res) => {
		try {
			const upload = createUpload('brandImage');
			await upload.fields([
				{ name: 'logo', maxCount: 1 },
				{ name: 'favIcon', maxCount: 1 },
				{ name: 'waterMarkIcon', maxCount: 1 }
			])(req, res, async (err) => {
				if (err) {
					errorLogger('Error uploading files:', err);
					return res.status(500).json({ message: 'Error uploading files', status: false });
				}
				try {
					// Brand data preparation
					const brandData = {
						brandName: req.body.brandName,
						tagLine: req.body.tagLine,
						email: req.body.email,
						emailPassword: req.body.emailPassword,
						phone: req.body.phone,
						address: req.body.address,
						googleMap: req.body.googleMap,
						whatsApp: req.body.whatsApp,
						website: req.body.website,
						time: req.body.time,
						userId: req.body.userId,
						footerDescriptionOne: req.body.footerDescriptionOne,
						footerDescriptionTwo: req.body.footerDescriptionTwo,
						footerSubHeadingOne: req.body.footerSubHeadingOne,
						footerSubHeadingTwo: req.body.footerSubHeadingTwo,

					};
					let existingBrand = await Settings.findOne({ userId: req.body.userId });


					// Update brandData only if file is defined
					const fileFields = ['logo', 'favIcon', 'waterMarkIcon'];

					fileFields.forEach((field) => {
						if (req.files[String(field)] && req.files[String(field)].length > 0) {
							brandData[String(field)] = req.files[String(field)][0].filename;
						} else if (existingBrand && existingBrand[String(field)]) {
							// Retain the existing image if no new file is uploaded
							brandData[String(field)] = existingBrand[String(field)];
						}
					});



					try {
						// Check if brand exists
						let existingBrand = await Settings.findOne({ userId: req.body.userId });

						// If brand doesn't exist, create a new one
						if (!existingBrand) {
							const newBrand = new Settings(brandData);
							existingBrand = await newBrand.save();
							return res
								.status(200)
								.json({ status: true, message: 'Brand added successfully', brand: existingBrand });
						}

						// If brand exists, update it only if new files are defined
						if (Object.keys(brandData).length > 1) {
							// Check if any field other than userId is updated
							existingBrand = await Settings.findOneAndUpdate({ userId: req.body.userId }, brandData, {
								new: true
							});
							const adminId = await getAdminDataByRole('users');
							await trackUserActivity(adminId, 'Brand details updated by admin');
							return res
								.status(200)
								.json({ status: true, message: 'Brand updated successfully', brand: existingBrand });
						}

						return res
							.status(200)
							.json({ status: true, message: 'No changes detected', brand: existingBrand });
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

	getSingleBrandDetails: async (req, res) => {
		try {
			const brand = await Settings.findOne({ userId: req.body.userId });
			res.status(200).json({ status: true, data: brand });
		} catch (error) {
			errorLogger(error);

			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	deleteBrandLogo: async (req, res) => {
		try {

			const brandId = req.body.brandId;
			// Find brand by dynamic ID
			const brand = await Settings.findById(brandId);
			if (!brand) {
				return res.status(404).json({ message: 'Brand not found', status: false });
			}

			// Remove the logo field from the brand
			if (req.body.logo === 'logo') {
				const filePath = path.join(__dirname, '../../storage/brandImage/original', brand.logo);
				if (fs.existsSync(filePath)) {
					await unlinkAsync(filePath);
				} else {
					console.log(`File not found: ${filePath}`);
				}
				brand.logo = null;

			} else if (req.body.favIcon === 'favIcon') {
				const filePath = path.join(__dirname, '../../storage/brandImage/original', brand.favIcon);
				if (fs.existsSync(filePath)) {
					await unlinkAsync(filePath);
				} else {
					console.log(`File not found: ${filePath}`);
				}
				brand.favIcon = null;

			} else if (req.body.waterMarkIcon === 'waterMarkIcon') {
				const filePath = path.join(__dirname, '../../storage/brandImage/original', brand.waterMarkIcon);
				await unlinkAsync(filePath);
				brand.waterMarkIcon = null;
			}
			await brand.save();
			res.status(200).json({ status: true, message: 'Brand logo deleted successfully' });
		} catch (error) {
			errorLogger(error);
			console.log(error, "error")
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	updatePaymentDetails: async (req, res) => {
		try {
			const paymentData = {
				stripeTestKey: req.body.stripeTestKey || null,
				stripeLiveKey: req.body.stripeLiveKey || null,
				paypalTestKey: req.body.paypalTestKey || null,
				paypalLiveKey: req.body.paypalLiveKey || null,
				paymentMode: req.body.paymentMode || null
			};

			const adminSettings = await Settings.findOneAndUpdate(
				{ userId: req.body.userId },
				{ $set: { payment: paymentData } },
				{ new: true, upsert: true }
			);
			const adminId = await getAdminDataByRole('users');
			await trackUserActivity(adminId, 'Payment details updated by admin');
			res.status(200).json({ status: true, message: 'Payment details updated successfully', adminSettings });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},
	updateSEODetails: async (req, res) => {
		try {
			const SEOData = {
				googleAnalytics: req.body.googleAnalytics || null,
				searchConsole: req.body.searchConsole || null,
				hotJar: req.body.hotJar || null,
				mailChimp: req.body.mailChimp || null
			};

			const adminSettings = await Settings.findOneAndUpdate(
				{ userId: req.body.userId },
				{ $set: { seo: SEOData } },
				{ new: true, upsert: true }
			);
			const adminId = await getAdminDataByRole('users');
			await trackUserActivity(adminId, 'Seo details updated by admin');
			res.status(200).json({ status: true, message: 'SEO details updated successfully', adminSettings });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	updateSocialLinks: async (req, res) => {
		try {
			const linksData = {
				facebook: req.body.facebook || null,
				twitter: req.body.twitter || null,
				linkedIn: req.body.linkedIn || null,
				instagram: req.body.instagram || null
			};

			const adminSettings = await Settings.findOneAndUpdate(
				{ userId: req.body.userId },
				{ $set: { socialLinks: linksData } },
				{ new: true, upsert: true }
			);
			const adminId = await getAdminDataByRole('users');
			await trackUserActivity(adminId, 'Social links updated by admin');
			res.status(200).json({ status: true, message: 'Social links updated successfully', adminSettings });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},
	updateSignature: async (req, res) => {
		try {
			const adminSettings = await Settings.findOneAndUpdate(
				{ userId: req.body.userId },
				{ $set: { emailSignature: req.body.description } },
				{ new: true, upsert: true }
			);
			const adminId = await getAdminDataByRole('users');
			await trackUserActivity(adminId, 'Signature updated by admin');
			res.status(200).json({ status: true, message: 'Signature updated successfully', adminSettings });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},
	updateEmailTemplate: async (req, res) => {
		try {
			const { templateId, name, subject, template, type } = req.body;
			console.log(req.body.templateId, 'templateId')
			if (templateId) {
				const existingTemplate = await EmailTemplate.findById(templateId);
				if (existingTemplate) {
					existingTemplate.name = name;
					existingTemplate.subject = subject;
					existingTemplate.template = template;
					existingTemplate.type = type;
					await existingTemplate.save();
					return res.status(200).json({ status: true, message: 'Email Template updated successfully' });
				}
			}
			const newEmailTemplate = new EmailTemplate({
				name,
				subject,
				template,
				type
			});
			await newEmailTemplate.save();
			const adminId = await getAdminDataByRole('users');
			await trackUserActivity(adminId, 'Email template updated by admin');
			res.status(201).json({ status: true, message: 'New Email Template created successfully' });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	getAllEmailTemplates: async (req, res) => {
		try {
			const emailTemplates = await EmailTemplate.find();
			res.status(200).json({ status: true, data: emailTemplates });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},
	addUpdateHeaderData: async (req, res) => {
		try {
			const { menuId, title, link, subMenu } = req.body;
			const headerData = { title, link, subMenu };
			let menu;

			if (menuId) {
				menu = await HeaderMenu.findByIdAndUpdate(menuId, headerData, { new: true });
				if (!menu) {
					return res.status(404).json({ status: false, message: 'Menu not found' });
				}
			} else {
				headerData.userId = req.body.userId;
				menu = new HeaderMenu(headerData);
				await menu.save();
			}
			const adminId = await getAdminDataByRole('users');
			await trackUserActivity(adminId, 'Header data updated by admin');
			res.status(200).json({ status: true, message: 'Header data updated successfully', menu });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	getHeaderMenus: async (req, res) => {
		try {
			// Fetch the most up-to-date header menu data
			const headerMenus = await HeaderMenu.find().sort({ order: 1 }); // Sort by order if needed
			res.status(200).json({ status: true, data: headerMenus });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},


	updateOrderOfMenu: async (req, res) => {
		try {
			const reqData = req.body;
			const updatePromises = reqData.map(async (item) => {
				return await HeaderMenu.findByIdAndUpdate(item.key, { order: item.order }, { new: true });
			});

			const updatedMenus = await Promise.all(updatePromises);

			const adminId = await getAdminDataByRole('users');
			await trackUserActivity(adminId, 'Header menu order updated by admin');

			res.status(200).json({ status: true, message: 'Header menu order updated successfully', updatedMenus });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	updateFooterOrderOfMenu: async (req, res) => {
		try {
			const reqData = req.body;
			const updatePromises = reqData.map(async (item) => {
				return await FooterMenu.findByIdAndUpdate(item.key, { order: item.order }, { new: true });
			});

			const updatedMenus = await Promise.all(updatePromises);

			const adminId = await getAdminDataByRole('users');
			await trackUserActivity(adminId, 'Header menu order updated by admin');

			res.status(200).json({ status: true, message: 'Header menu order updated successfully', updatedMenus });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},
	addUpdateFooterData: async (req, res) => {
		try {
			const { menuId, title, link, subMenu } = req.body;
			const footerData = { title, link, subMenu };
			let menu;

			if (menuId) {
				menu = await FooterMenu.findByIdAndUpdate(menuId, footerData, { new: true });
				if (!menu) {
					return res.status(404).json({ status: false, message: 'Menu not found' });
				}
			} else {
				footerData.userId = req.body.userId;
				menu = new FooterMenu(footerData);
				await menu.save();
			}
			const adminId = await getAdminDataByRole('users');
			await trackUserActivity(adminId, 'Footer data updated by admin');
			res.status(200).json({ status: true, message: 'Footer data updated successfully', menu });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	getFooterMenus: async (req, res) => {
		try {
			const footerMenus = await FooterMenu.find().sort({ order: 1 });
			res.status(200).json({ status: true, data: footerMenus });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	deleteHeaderMenu: async (req, res) => {
		try {
			const { menuId } = req.body;
			const deletedMenu = await HeaderMenu.findByIdAndDelete(menuId);
			if (!deletedMenu) {
				return res.status(404).json({ status: false, message: 'Menu not found' });
			}
			const adminId = await getAdminDataByRole('users');
			await trackUserActivity(adminId, 'Header menu deleted by admin');
			res.status(200).json({ status: true, message: 'Header menu deleted successfully', deletedMenu });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},
	deleteFooterMenu: async (req, res) => {
		try {
			const { menuId } = req.body;
			const deletedMenu = await FooterMenu.findByIdAndDelete(menuId);
			if (!deletedMenu) {
				return res.status(404).json({ status: false, message: 'Menu not found' });
			}
			const adminId = await getAdminDataByRole('users');
			await trackUserActivity(adminId, 'Footer menu deleted by admin');
			res.status(200).json({ status: true, message: 'Footer menu deleted successfully', deletedMenu });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},
	addUpdateForumData: async (req, res) => {
		try {
			const upload = createUpload('forumImages');
			await upload.single('attachment')(req, res, async (err) => {
				if (err) {
					errorLogger('Error uploading attachment:', err);
					return res.status(500).json({ message: 'Error uploading attachment', status: false });
				}
				try {
					const forumData = {
						title: req.body.title,
						description: req.body.description,
						userId: req.body.userId,
						attachment: req.file ? req.file.filename : null
					};

					let forum;

					if (req.body.forumId) {
						forum = await Forum.findByIdAndUpdate(req.body.forumId, forumData, { new: true });
						if (!forum) {
							return res.status(404).json({ status: false, message: 'Forum not found' });
						}
					} else {
						forumData.userId = req.body.userId;
						forum = new Forum(forumData);
						await forum.save();
					}
					const adminId = await getAdminDataByRole('users');
					await trackUserActivity(adminId, 'Forum data updated by admin');
					res.status(200).json({ status: true, message: 'Forum data updated successfully', forum });
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

	getAllForums: async (req, res) => {
		try {
			const forums = await Forum.find().sort({ createdAt: -1 });
			const forumsWithViewCount = await Promise.all(
				forums.map(async (forum) => {
					const viewCount = await ForumViewCount.countDocuments({ forumId: forum._id });
					forum.viewCount = viewCount;
					return forum;
				})
			);

			res.status(200).json({ status: true, data: forumsWithViewCount });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	deleteForumAttachment: async (req, res) => {
		try {
			const forum = await Forum.findById(req.body.forumId);
			if (!forum) {
				return res.status(404).json({ message: 'Forum not found', status: false });
			}

			await unlinkImage('forumImages', forum.attachment);

			forum.attachment = null;

			await forum.save();
			res.status(200).json({ status: true, message: 'Forum attachment deleted successfully' });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	}
};

module.exports = settingController;
