const Complexity = require('../../models/complexity');
const errorLogger = require('../../../logger');
const mongoose = require('mongoose');
const { isValidObjectId } = require('mongoose');
const { createNotification } = require('../../common/notifications');
const User = require("../../models/Users")
const Question = require("../../models/Question")
const { getUserRole } = require('../../utils/dynamicRole')

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

    addUpdateComplexityDetails: async (req, res) => {
        try {
            const { complexityLevel, createdBy, updateId } = req.body;
            const userRole = await getUserRole(createdBy);
            // Sanitize complexityLevel
            const sanitizedComplexityLevel = complexityLevel.trim().toLowerCase();

            const complexityData = {
                complexityLevel: sanitizedComplexityLevel || 'untitled complexity',
            };

            const duplicateCheckQuery = updateId
                ? { complexityLevel: sanitizedComplexityLevel, _id: { $ne: updateId } }
                : { complexityLevel: sanitizedComplexityLevel };

            const duplicateComplexity = await Complexity.findOne(duplicateCheckQuery);

            if (duplicateComplexity) {
                return res.status(400).json({ status: false, message: 'Complexity already exists' });
            }

            if (updateId) {
                // Update existing Complexity
                const existingComplexity = await Complexity.findById(updateId);


                if (!existingComplexity) {
                    return res.status(404).json({ status: false, message: 'Complexity not found' });
                }

                // Merge new data into the existing Complexity
                Object.assign(existingComplexity, complexityData);

                await existingComplexity.save();
                const createNotificationMessage = {
                    notification: `Complexity "${sanitizedComplexityLevel}" has been updated successfully.`,
                    type: 'update',
                    notifyBy: createdBy,
                    notifyTo: createdBy, // Assuming createdBy is the user who made the change
                    createdAt: new Date(),
                    url: `/${userRole}/complexity`, // URL for viewing the updated complexity
                };

                // Send the notification
                createNotification(createNotificationMessage);

                return res.status(200).json({ status: true, message: 'Complexity updated successfully' });
            } else {
                // Create a new Complexity
                const newComplexity = new Complexity({
                    ...complexityData,
                    createdBy: createdBy || null,
                });

                await newComplexity.save();

                const createNotificationMessage = {
                    notification: `Complexity "${sanitizedComplexityLevel}" has been created successfully.`,
                    type: 'create',
                    notifyBy: createdBy,
                    notifyTo: createdBy,
                    createdAt: new Date(),
                    url: `/${userRole}/complexity`,  // Update the URL if necessary
                };

                // Call the function to create the notification
                createNotification(createNotificationMessage);

                return res.status(200).json({ status: true, message: 'Complexity added successfully' });
            }
        } catch (error) {
            errorLogger('Unexpected error:', error);
            res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    },

    deleteComplexity: async (req, res) => {
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


            // Step 1: Check if any of the states are assigned in Package, Test, or ExamType
            const isAssignedInQuestion = await Question.find({ complexityId: { $in: objectIdArray } });

            // If any state is assigned in any of these tables, prevent deletion
            let errorMessage = 'Complexity cannot be deleted as it is assigned to:';
            const assignments = [];

            if (isAssignedInQuestion.length) {
                assignments.push('Question');
            }

            if (assignments.length) {
                return res.status(400).json({
                    status: false,
                    message: `${errorMessage} ${assignments.join(', ')}.`,
                });
            }
            await Complexity.deleteMany({ _id: { $in: objectIdArray } });
            const admins = await User.findOne({ role: 'admin' });
            const userRole = await getUserRole(admins._id);

            if (!admins) {
                return res.status(404).json({ status: false, message: 'Admin not found' });
            }

            const notification = {
                notification: `Complexity  have been deleted successfully.`,
                type: 'deletion',
                notifyBy: admins._id,
                notifyTo: admins._id,
                createdAt: new Date(),
                url: `/${userRole}/complexity`,
            };


            createNotification(notification);

            res.status(200).json({ status: true, message: 'Complexity deleted successfully' });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    },
};

module.exports = complexityController;
