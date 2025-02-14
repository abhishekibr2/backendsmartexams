const jwt = require('jsonwebtoken');

const { JWT_SECRET } = require('../config/envConfig');
const users = require('../models/Users');

const verifyToken = (req, res, next) => {
	//const token = req.headers.authorization;
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (!token) {
		return res.status(401).json({ message: 'Unauthorized - Token not provided' });
	}

	jwt.verify(token, JWT_SECRET, async (err, decoded) => {
		if (err) {
			if (err.name === 'TokenExpiredError') {
				return res.status(401).json({ message: 'Unauthorized - Token expired' });
			}
			return res.status(401).json({ message: 'Unauthorized - Invalid token' });
		}
		const user = await users.findById(decoded.userId);
		req.user = { ...decoded, ...user };
		next();
	});
};

module.exports = verifyToken;
