const fs = require('fs').promises;
const path = require('path');
const errorLogger = require('../../logger');

const unlinkImage = async (mainFolder, imageName) => {
	const subFolders = ['original', 'medium', 'small'];

	for (const subFolder of subFolders) {
		const filePath = path.join(__dirname, '../storage/', mainFolder, subFolder, imageName);

		try {
			// Check if the file exists
			await fs.access(filePath);

			// Unlink (delete) the file
			// await fs.unlink(filePath);
		} catch (err) {
			if (err.code === 'ENOENT') {
				errorLogger(`File not found: ${filePath}`);
			} else {
				errorLogger(`Error deleting file: ${filePath}`, err);
			}
		}
	}
};

module.exports = unlinkImage;
