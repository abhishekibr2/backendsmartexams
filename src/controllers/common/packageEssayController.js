const PackageEssay = require('../../models/packageEssay');
const errorLogger = require('../../../logger');

const packageEssayController = {
    getAllPackageEssay: async (req, res) => {
        try {

            const PackageEssays = await PackageEssay.find().sort({ _id: -1 });

            res.status(200).json({ status: true, data: PackageEssays });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },
};

module.exports = packageEssayController;
