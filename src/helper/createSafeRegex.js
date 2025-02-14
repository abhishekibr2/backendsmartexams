function createSafeRegex(key, option) {
	const sanitizedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const placeholder = `\\*\\|${sanitizedKey}\\|\\*`;

	// eslint-disable-next-line security/detect-non-literal-regexp
	return new RegExp(placeholder, option);
}

module.exports = createSafeRegex;
