const State = require('../../models/State');
const errorLogger = require('../../../logger');
const mongoose = require('mongoose');
const { isValidObjectId } = require('mongoose');

const stateController = {
    getAllState: async (req, res) => {
        try {
            const states = await State.find().sort({ _id: -1 });
            res.status(200).json({ status: true, data: states });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    addUpdateStateDetails: async (req, res) => {
        try {
            const { title, description, stateId, updateId, } = req.body;
            const stateData = {
                title: title || 'Untitled State',
                description: description || '',
            };

            try {
                if (updateId) {
                    // Update existing state
                    const existingState = await State.findById(updateId);

                    if (!existingState) {
                        return res.status(404).json({ status: false, message: 'State not found' });
                    }

                    // Merge new data into the existing state
                    Object.assign(existingState, stateData);

                    await existingState.save();

                    return res.status(200).json({ status: true, message: 'State updated successfully' });
                } else {
                    // Create a new state
                    const newstate = new State({
                        ...stateData,
                        createdBy: stateId || null,
                        image: req.file ? req.file.filename : undefined,
                    });

                    await newstate.save();

                    return res.status(200).json({ status: true, message: 'State added successfully' });
                }
            } catch (error) {
                errorLogger('Error processing State:', error);
                return res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
            }
        } catch (error) {
            errorLogger('Unexpected error:', error);
            res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    },

    deleteState: async (req, res) => {
        try {
            const ids = Array.isArray(req.body) ? req.body.flat() : [];
            if (!ids.length) {
                return res.status(400).json({ status: false, message: 'No IDs provided for deletion' });
            }

            const invalidIds = ids.filter((id) => !isValidObjectId(id));
            if (invalidIds.length) {
                return res.status(400).json({ status: false, message: `Invalid IDs: ${invalidIds.join(', ')}` });
            }

            const objectIdArray = ids.map((id) => new mongoose.Types.ObjectId(id));
            await State.deleteMany({ _id: { $in: objectIdArray } });

            res.status(200).json({ status: true, message: 'State deleted successfully' });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    },
};

module.exports = stateController;
