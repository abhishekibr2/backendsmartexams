const User = require('../models/Users');


async function getUserRole(userId) {
    const user = await User.findById(userId)
        .populate('roleId', 'roleName')
        .select('roleId');
    return user.roleId.roleName || 'student';
}

module.exports = {
    getUserRole
};
