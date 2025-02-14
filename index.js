const express = require('express');
const connectDB = require('./src/utils/db');
const app = express();
const cors = require('cors');
const logError = require('./logger');
const routes = require('./src/routes');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { PORT } = require('./src/config/envConfig');
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

const fs = require('fs');
// Connect to MongoDB
connectDB();


app.use('/emailTemplate', express.static(path.join(__dirname, 'src/storage/emailTemplate/original')));

// In-memory store for blocked IPs
const blockedIPsFile = path.join(__dirname, 'blocked-ips.json');
let blockedIPs = new Set();
if (fs.existsSync(blockedIPsFile)) {
	const data = fs.readFileSync(blockedIPsFile, 'utf-8');
	blockedIPs = new Set(JSON.parse(data));
}

// Middleware to check if an IP is blocked
const blockMiddleware = (req, res, next) => {
	if (blockedIPs.has(req.ip)) {
		return res.status(403).json({
			message: 'Your IP has been blocked due to too many requests.',
			status: 403
		});
	}
	next();
};

// Save blocked IPs to file
const saveBlockedIPs = () => {
	fs.writeFileSync(blockedIPsFile, JSON.stringify(Array.from(blockedIPs)));
};

// Configure rate limiting
const limiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minutes
	max: 600, // limit each IP to 600 requests per windowMs
	handler: (req, res) => {
		blockedIPs.add(req.ip); // Add IP to the blocked list
		saveBlockedIPs(); // Save to file
		res.status(429).json({
			message: 'Your IP has been blocked due to exceeding 600 requests in one minute!',
			status: 429
		});
	}
});

// Connect to Trigger

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(fileUpload());

app.use(blockMiddleware); // Apply the block checking middleware to all requests
app.use(limiter);

app.set('view engine', 'ejs');

// Global error handler middleware
const globalErrorHandler = (err, req, res, next) => {
	logError(err, req, res, next);
};

app.use(globalErrorHandler);

// Call all routes
app.use(routes);

app.get('/', async (req, res) => {
	res.send('Welcome to the Api');
});

app.use('/images', express.static(path.join(__dirname, 'src', 'storage')));
// Start server
const port = PORT || 3001;

app.listen(port, (err) => {
	if (err) {
		console.error('Failed to start server:', err);
	}
	console.log(`Server is running on http://localhost:${port}`);
});
