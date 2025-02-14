function convertSize(sizeInKB) {
	if (sizeInKB < 1024) {
		return sizeInKB + ' KB'; // Return in KB if less than 1 MB
	} else {
		const sizeInMB = sizeInKB / 1024;
		return sizeInMB.toFixed(2) + ' MB'; // Convert to MB with 2 decimal places
	}
}

module.exports = convertSize;
