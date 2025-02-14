const mongoose = require('mongoose');

// Define the schema for roles
const roleSchema = new mongoose.Schema({
	roleName: { type: String, unique: true, required: true, index: true },
	permissions: Object,
	status: { type: String, enum: ['active', 'inactive', 'deleted', 'suspended'], default: 'active' },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
	createdAt: { type: Date, default: Date.now },
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
	updatedAt: { type: Date, default: Date.now },
	deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
	deletedAt: { type: Date, default: Date.now }
});

// Create the Role model using the schema
const Role = mongoose.model('roles', roleSchema);

module.exports = Role;
