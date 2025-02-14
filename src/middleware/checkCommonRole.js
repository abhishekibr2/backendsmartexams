const User = require('../models/Users');

// const checkCommonRole = () => {
//     return (req, res, next) => {
//         const userRole = req.user.role;

//         if (userRole == 'admin' || userRole == 'admin') {
//             // User has the required role, grant access
//             next();
//         } else {
//             res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
//         }
//     };
// };

const checkCommonRole = () => {
    return async (req, res, next) => {
        const userId = req.user.userId;
        try {
            const user = await User.findById(userId).populate('roleId');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            const userRole = user.roleId.roleName;
            const userRoleFrontend = req.user.role;
            if (userRole == userRoleFrontend) {
                // User has the required role, grant access
                next();
            } else {
                res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
            }
        } catch (err) {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };
};

module.exports = checkCommonRole;
