/* eslint-disable security/detect-non-literal-fs-filename */
const multer = require('multer');
const fs = require('fs/promises');
const sharp = require('sharp');
const Settings = require('../models/adminSettings');

const storage = (folderName) =>
	multer.diskStorage({
		destination: async (req, file, cb) => {
			const folderPath = `src/storage/${folderName}/original`;
			try {
				await fs.mkdir(folderPath, { recursive: true });
				cb(null, folderPath);
			} catch (error) {
				cb(error, folderPath);
			}
		},
		filename: (req, file, cb) => {
			cb(null, Date.now() + '-' + file.originalname);
		}
	});

const addWatermark = async (imageBuffer, watermarkPath, gravity) => {
	const { width, height } = await sharp(imageBuffer).metadata();
	const watermarkSize = Math.round(Math.min(width, height) * 0.3);
	const watermark = await sharp(watermarkPath).resize({ fit: 'contain', width: watermarkSize }).toBuffer();
	return sharp(imageBuffer)
		.composite([{ input: watermark, gravity }])
		.toBuffer();
};

const createUploadWithWatermark = (folderName) => {
	const upload = multer({ storage: storage(folderName) });

	return {
		single: (fieldName) => async (req, res, next) => {
			upload.single(fieldName)(req, res, async (err) => {
				if (err) return res.status(500).json({ message: 'Error uploading file', status: false });

				const sizes = [
					{ suffix: 'extraSmall', width: 50, height: 50 },
					{ suffix: 'small', width: 200 },
					{ suffix: 'medium', width: 400 }
				];
				if (!req.file) return next();

				const imagePath = req.file.path;
				const fileName = req.file.filename;
				const originalFilePath = `src/storage/${folderName}/original/${fileName}`;
				const watermarkPath = 'src/storage/waterMark/Logo.png';

				try {
					// Watermark the original image
					const originalImageBuffer = await sharp(imagePath).toBuffer();
					const watermarkedOriginal = await addWatermark(originalImageBuffer, watermarkPath, 'southeast');
					await fs.writeFile(originalFilePath, watermarkedOriginal);

					// Process and watermark resized images
					for (const size of sizes) {
						const resizedImageBuffer = await sharp(originalFilePath)
							.resize(size.width, size.height)
							.toBuffer();
						const watermarkedResized = await addWatermark(resizedImageBuffer, watermarkPath, 'southeast');
						const folderPath = `src/storage/${folderName}/${size.suffix}`;
						const filePath = `${folderPath}/${fileName}`;
						await fs.mkdir(folderPath, { recursive: true });
						await fs.writeFile(filePath, watermarkedResized);
					}

					req.uploadedFilename = fileName;
					next();
				} catch (error) {
					console.error(error);
					return res.status(500).json({ message: 'Error processing image', status: false });
				}
			});
		}
	};
};

const processAndSaveImages = async (file, folderName, fileType = 'png') => {
	const sizes = [
		{ suffix: 'extraSmall', width: 50, height: 50 },
		{ suffix: 'small', width: 200 },
		{ suffix: 'medium', width: 400 }
	];
	const imagePath = file.path;
	const fileName = file.filename;
	const originalFilePath = `src/storage/${folderName}/original/${fileName}`;
	const watermarkIconFile = await Settings.findOne();
	const watermarkPath = `src/storage/brandImage/original/${watermarkIconFile.waterMarkIcon}`;

	if (watermarkIconFile.toggleEnabled && fileType !== 'excel') {
		const originalImageBuffer = await sharp(imagePath).toBuffer();
		const watermarkedOriginal = await addWatermark(originalImageBuffer, watermarkPath, 'southeast');
		await fs.writeFile(originalFilePath, watermarkedOriginal);

		// Process and save resized images
		for (const size of sizes) {
			const resizedImageBuffer = await sharp(originalFilePath).resize(size.width, size.height).toBuffer();
			const watermarkedResized = await addWatermark(resizedImageBuffer, watermarkPath, 'southeast');
			const folderPath = `src/storage/${folderName}/${size.suffix}`;
			const filePath = `${folderPath}/${fileName}`;
			await fs.mkdir(folderPath, { recursive: true });
			await fs.writeFile(filePath, watermarkedResized);
		}

		return fileName;
	} else {
		if (fileType !== 'excel') {
			// Save the original image
			const originalImageBuffer = await sharp(imagePath).toBuffer();
			await fs.writeFile(originalFilePath, originalImageBuffer);
			// Process and save resized images
			for (const size of sizes) {
				const resizedImageBuffer = await sharp(originalFilePath).resize(size.width, size.height).toBuffer();
				const folderPath = `src/storage/${folderName}/${size.suffix}`;
				const filePath = `${folderPath}/${fileName}`;
				await fs.mkdir(folderPath, { recursive: true });
				await fs.writeFile(filePath, resizedImageBuffer);
			}
		}
		return fileName;
	}
};
const processAndSavePDF = async (file, folderName) => {
	const filePath = file.path;
	const fileName = file.filename;
	const destinationFolder = `src/storage/${folderName}/pdfs`;

	await fs.mkdir(destinationFolder, { recursive: true });
	const pdfFilePath = `${destinationFolder}/${fileName}`;
	await fs.rename(filePath, pdfFilePath);
	return fileName;  // Return the saved PDF file name
};


const createUpload = (folderName) => {
	const upload = multer({ storage: storage(folderName) });
	return {
		single: (fieldName) => async (req, res, next) => {
			upload.single(fieldName)(req, res, async (err) => {
				if (err) return res.status(500).json({ message: 'Error uploading file', status: false });
				if (!req.file) return next();

				try {
					req.uploadedFilename = await processAndSaveImages(req.file, folderName, 'excel');
					next();
				} catch (error) {
					console.error(error);
					return res.status(500).json({ message: 'Error processing image', status: false });
				}
			});
		},

		fields: (fields) => async (req, res, next) => {
			upload.fields(fields)(req, res, async (err) => {

				if (err) return res.status(500).json({ message: 'Error uploading files', status: false });
				try {
					for (const fieldName of Object.keys(req.files)) {
						const files = req.files[String(fieldName)];
						for (const file of files) {

							// Check if the file is an image or a PDF and process accordingly
							if (file.mimetype.startsWith('image/')) {
								await processAndSaveImages(file, folderName);  // Process images
							} else if (file.mimetype === 'application/pdf') {
								await processAndSavePDF(file, folderName);  // Process PDFs
							} else {
								console.log('Unsupported file type:', file.mimetype);
							}
						}
					}
					next();
				} catch (error) {
					console.error(error);
					return res.status(500).json({ message: 'Error processing files', status: false });
				}
			});
		},


		multiple: (fieldNames) => async (req, res, next) => {
			upload.array(fieldNames)(req, res, async (err) => {
				if (err) return res.status(500).json({ message: 'Error uploading files', status: false });
				try {
					for (const file of req.files) {
						const sizes = [
							{ suffix: 'extraSmall', width: 50, height: 50 },
							{ suffix: 'small', width: 200 },
							{ suffix: 'medium', width: 400 }
						];
						const imagePath = file.path;
						const fileName = file.filename;
						const originalFilePath = `src/storage/${folderName}/original/${fileName}`;

						// Save the original image
						const originalImageBuffer = await sharp(imagePath).toBuffer();
						await fs.writeFile(originalFilePath, originalImageBuffer);

						// Process and save resized images
						for (const size of sizes) {
							const resizedImageBuffer = await sharp(originalFilePath)
								.resize(size.width, size.height)
								.toBuffer();
							const folderPath = `src/storage/${folderName}/${size.suffix}`;
							const filePath = `${folderPath}/${fileName}`;
							await fs.mkdir(folderPath, { recursive: true });
							await fs.writeFile(filePath, resizedImageBuffer);
						}
					}

					next();
				} catch (error) {
					return res.status(500).json({ message: 'Error processing images', status: false });
				}
			});
		}
	};
};

module.exports = { createUploadWithWatermark, createUpload };
