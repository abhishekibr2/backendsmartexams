const Package = require('../../models/packageModel');
const errorLogger = require('../../../logger');

const packageController = {

    getAllPackages: async (req, res) => {
        try {
            const { stateId, examTypeId } = req.query;

            // Construct filter object based on the presence of stateId and examTypeId
            const filter = { isActive: "yes" };

            // Only add state and examType filters if their corresponding query params are provided
            if (stateId) {
                filter.state = stateId;
            }
            if (examTypeId) {
                filter.examType = examTypeId;
            }
            const packages = await Package.find(filter)
                .populate('state subjectsInPackage examType grade packageDuration')
                .sort({ createdAt: -1 });
            res.status(200).json({ status: true, data: packages });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },



}

module.exports = packageController;
