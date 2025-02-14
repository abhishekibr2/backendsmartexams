const Role = require('../../models/roles');
const logError = require('../../../logger');

const roleController = {
	allRoles: async (req, res) => {
		try {
			const roles = await Role.find({ status: { $in: ['active', 'inactive'] } }).sort({ _id: -1 });
			res.status(200).json({ status: true, data: roles });
		} catch (error) {
			logError(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	addUpdateRoleDetails: async (req, res) => {
		try {
			const roleData = {
				roleName: req.body.roleName,
				permissions: req.body.permissions,
				status: req.body.status,
				createdBy: req.body.userId
			};

			try {
				// Check if the role name already exists
				const existingRole = await Role.findOne({ roleName: roleData.roleName });

				if (
					existingRole &&
					(!req.body.roleId ||
						(req.body.roleId && req.body.roleId.toString() !== existingRole._id.toString()))
				) {
					return res
						.status(400)
						.json({ status: false, message: 'Role name already exists. Please choose a different one.' });
				}

				if (req.body.roleId) {
					const existingRole = await Role.findById(req.body.roleId);

					if (!existingRole) {
						return res.status(404).json({ status: false, message: 'Role not found' });
					}

					Object.assign(existingRole, roleData);
					existingRole.updatedBy = req.body.userId;
					await existingRole.save();

					res.status(200).json({ status: true, message: 'Role updated successfully' });
				} else {
					const newRole = new Role(roleData);
					await newRole.save();
					res.status(200).json({ status: true, message: 'Role added successfully' });
				}
			} catch (error) {
				logError('Error processing Role operation:', error);
				res.status(500).json({ status: false, message: 'Internal Server Error' });
			}
		} catch (error) {
			logError(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	},

	deleteRole: async (req, res) => {
		try {
			const { id } = req.body;
			const deletedRole = await Role.deleteOne({ _id: id });
			if (deletedRole.deletedCount === 0) {
				return res.status(404).json({ message: 'Role not found', status: false });
			}
			res.json({ message: 'Role has been deleted successfully', status: true });
		} catch (error) {
			logError(error);
			res.status(500).json({ message: 'Internal Server Error' });
		}
	}
};

module.exports = roleController;
