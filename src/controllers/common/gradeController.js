const Grade = require('../../models/grade');
const errorLogger = require('../../../logger');

const gradeController = {
    getAllGrades: async (req, res) => {
        try {
            const grades = await Grade.find().sort({ _id: -1 });
            res.status(200).json({ status: true, data: grades });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },
}
module.exports = gradeController;
