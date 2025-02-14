const Subject = require('../../models/subject');
const errorLogger = require('../../../logger');

const subjectController = {
    getAllSubjects: async (req, res) => {
        try {
            const subjects = await Subject.find().sort({ _id: -1 });
            res.status(200).json({ status: true, data: subjects });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },
};

module.exports = subjectController;
