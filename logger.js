const { createLogger, format } = require('winston');
const path = require('path');
const DailyRotateFile = require('winston-daily-rotate-file');

const logDirectory = path.join(__dirname, 'errorLogs');
const logger = createLogger({
	format: format.combine(format.timestamp(), format.json()),
	transports: [
		new DailyRotateFile({
			filename: path.join(logDirectory, 'error-%DATE%.log'),
			datePattern: 'YYYY-MM-DD',
			zippedArchive: true,
			maxSize: '20m', // Set a suitable max size for each log file
			maxFiles: '90d' // Retain log files for 90 days (3 months)
		})
	]
});

const logError = (error) => {
	// Capture stack trace information
	const errorWithStackTrace = new Error(error);
	Error.captureStackTrace(errorWithStackTrace, logError);

	// Log the error using Winston logger
	logger.error({
		message: errorWithStackTrace.message,
		stack: parseStackTrace(errorWithStackTrace.stack)
	});

	// Log the error to the console
	// eslint-disable-next-line no-console
	console.error(errorWithStackTrace);
};

// Function to parse stack trace and extract relevant information
const parseStackTrace = (stack) => {
	const stackLines = stack.split('\n');
	const relevantLine = stackLines.find((line) => line.includes(__dirname));
	return relevantLine ? relevantLine.trim() : stackLines[1].trim();
};

module.exports = logError;
