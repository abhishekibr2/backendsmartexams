const State = require('../../models/State');
const errorLogger = require('../../../logger');

const stateController = {
    getAllStates: async (req, res) => {
        try {
            const state = await State.find({ status: { $in: ['active', 'inactive'] } }).sort({ _id: -1 });
            res.status(200).json({ status: true, data: state });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    }
};

module.exports = stateController;
