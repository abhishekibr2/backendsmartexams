const ExamType = require('../../models/examType');
const errorLogger = require('../../../logger');

const examTypeController = {
    getAllExamType: async (req, res) => {
        try {
            const examTypes = await ExamType.find().populate('stateId').populate('complexityId').sort({ _id: -1 });
            res.status(200).json({ status: true, data: examTypes });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },
};
module.exports = examTypeController
