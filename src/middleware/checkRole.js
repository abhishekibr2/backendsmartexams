const checkRole = (requiredRole) => {
	return (req, res, next) => {
		const userRole = req.user.role;
		if (userRole === requiredRole) {
			// User has the required role, grant access
			next();
		} else {
			res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
		}
	};
};

module.exports = checkRole;
