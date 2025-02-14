const Receipt = require('../../models/Receipt');
const errorLogger = require('../../../logger');

const invoiceController = {
	getReceipt: async (req, res) => {
		try {
			const receipt = await Receipt.find();
			res.status(200).json({ status: true, data: receipt });
		} catch (error) {
			errorLogger(error);
			res.status(500).json({ status: false, message: 'Internal Server Error' });
		}
	}
};

module.exports = invoiceController;
