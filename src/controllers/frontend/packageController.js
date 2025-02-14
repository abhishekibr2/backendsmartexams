const Package = require('../../models/packageModel');
const errorLogger = require('../../../logger');

const publishPackageController = {


    getAllTestPacks: async (req, res) => {
        try {

            const { stateId, examTypeId } = req.body;

            const activeAndLatestPackage = await Package.find({ state: stateId, examType: examTypeId, isPublished: true })
                .sort({ createdAt: -1 })
                .populate('packageDuration', 'DurationTime')
                .populate('state', 'title')
                .populate('examType', 'examType')

            res.status(200).json({ status: true, data: activeAndLatestPackage });
        } catch (error) {
            console.log(error);
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    singlePackage: async (req, res) => {
        try {
            const slug = req.params.slug;
            const singlePackage = await Package.findOne({ slug: slug })
            if (!singlePackage) {
                return res.status(404).json({ status: false, message: 'package not found' });
            }
            res.status(200).json({ status: true, data: singlePackage, });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },
}
module.exports = publishPackageController
