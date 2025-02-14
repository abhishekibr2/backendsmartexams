const Complexity = require('../../models/complexity');
const errorLogger = require('../../../logger');

const complexityController = {
    getAllComplexity: async (req, res) => {
        try {
            const complexity = await Complexity.find().sort({ _id: -1 });
            res.status(200).json({ status: true, data: complexity });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },
};

module.exports = complexityController;
