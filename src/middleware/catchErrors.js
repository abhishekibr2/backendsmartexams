const errorLogger = require('../../logger');
const catchErrors = (handler) => async (req, res, next) => {
	try {
		await handler(req, res, next);
	} catch (error) {
		errorLogger(error);
		res.status(500).json({ message: error.message });
	}
};

module.exports = catchErrors;
