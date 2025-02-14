const mongoose = require('mongoose');

const capitalize = (str) => {
	if (typeof str !== 'string') return str;
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const userSchema = new mongoose.Schema({
	name: { type: String, default: null },
	lastName: { type: String, default: null },
	fatherName: { type: String, default: null },
	course: { type: String, default: null },
	referCode: { type: String, default: null },
	email: { type: String, unique: true, required: true, index: true },
	roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'roles', default: null },
	role: { type: String, default: 'user' },
	slug: { type: String, default: null },
	password: { type: String, default: null },
	isShowEmail: { type: Boolean, default: false },
	isEmailVerified: { type: Boolean, default: false },
	phoneNumber: { type: String, default: null },
	isShowPhoneNumber: { type: Boolean, default: false },
	isPhoneVerified: { type: Boolean, default: false },
	designation: { type: String, default: null },
	passwordUpdatedAt: { type: Date, default: null },
	wrongPasswordCount: { type: Number, default: 0 },
	isBlocked: { type: Boolean, default: false },
	gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
	image: {
		type: String,
		default: null
	},
	fileManagerDirectory: { type: String, default: null },
	dob: { type: Date, default: null },
	bio: { type: String, default: null },
	otp: { type: Number, default: null },
	resetToken: { type: String, default: null },
	profileViewCount: { type: Number, default: 0 },
	address: {
		street: { type: String, default: null },
		building: { type: String, default: null },
		city: { type: String, default: null },
		zip: { type: String, default: null },
		state: { type: String, default: null },
		country: { type: String, default: null },
		lat: { type: String, default: null },
		long: { type: String, default: null }
	},
	billingAddress: {
		addressOne: { type: String, default: null },
		addressTwo: { type: String, default: null },
		city: { type: String, default: null },
		zip: { type: String, default: null },
		state: { type: String, default: null },
		country: { type: String, default: null },
		companyName: { type: String, default: null },
		taxNumber: { type: String, default: null }
	},
	socialLinks: {
		twitter: { type: String, default: null },
		facebook: { type: String, default: null },
		linkedin: { type: String, default: null },
		instagram: { type: String, default: null },
		website: { type: String, default: null }
	},
	metaTitle: { type: String, default: null },
	metaDescription: { type: String, default: null },
	subscriptionExpiryDate: { type: Date, default: null },
	stripeCustomerId: { type: String, default: null },
	lastSeen: { type: Date, default: null },
	isOnline: { type: String, enum: ['yes', 'no'], default: 'yes' },
	twoFactorAuth: { type: String, enum: ['enabled', 'disabled'], default: 'disabled' },
	loginType: { type: String, default: null },
	isReported: { type: Boolean, default: false },
	stickyNote: { type: String, default: null },
	timeZone: { type: String, default: 'Asia/Kolkata' },
	block: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
	chatStatus: { type: String, enum: ['online', 'offline', 'default'], default: 'default' },
	status: { type: String, enum: ['active', 'inactive', 'deleted', 'suspended', 'blocked'], default: 'active' },
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
	createdAt: { type: Date, default: Date.now },
	updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
	updatedAt: { type: Date, default: Date.now },
	deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users', default: null },
	deletedAt: { type: Date, default: null }
});

// eslint-disable-next-line sonarjs/cognitive-complexity
userSchema.pre('save', function (next) {
	if (this.isModified('name')) {
		this.name = capitalize(this.name);
	}
	if (this.isModified('designation')) {
		this.designation = capitalize(this.designation);
	}
	if (this.isModified('address')) {
		if (this.address.street) this.address.street = capitalize(this.address.street);
		if (this.address.building) this.address.building = capitalize(this.address.building);
		if (this.address.city) this.address.city = capitalize(this.address.city);
		if (this.address.state) this.address.state = capitalize(this.address.state);
		if (this.address.country) this.address.country = capitalize(this.address.country);
	}
	if (this.isModified('billingAddress')) {
		if (this.billingAddress.addressOne) this.billingAddress.addressOne = capitalize(this.billingAddress.addressOne);
		if (this.billingAddress.addressTwo) this.billingAddress.addressTwo = capitalize(this.billingAddress.addressTwo);
		if (this.billingAddress.city) this.billingAddress.city = capitalize(this.billingAddress.city);
		if (this.billingAddress.state) this.billingAddress.state = capitalize(this.billingAddress.state);
		if (this.billingAddress.country) this.billingAddress.country = capitalize(this.billingAddress.country);
		if (this.billingAddress.companyName)
			this.billingAddress.companyName = capitalize(this.billingAddress.companyName);
	}
	next();
});

const users = mongoose.model('users', userSchema);

module.exports = users;
