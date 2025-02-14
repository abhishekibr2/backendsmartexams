const State = require('../../models/State');
const errorLogger = require('../../../logger');
const mongoose = require('mongoose');
const { isValidObjectId } = require('mongoose');
const { createNotification } = require('../../common/notifications');
const User = require("../../models/Users")
const Package = require("../../models/packageModel")
const Test = require("../../models/test")
const ExamType = require("../../models/examType")

const stateController = {
    getAllStates: async (req, res) => {
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
            const { title, description, status, stateId, updateId, createdBy } = req.body;

            // Sanitize title
            const sanitizedTitle = title.trim().toUpperCase();

            const generateSlug = (name) => {
                return name
                    .toLowerCase()       // Convert to lowercase
                    .trim()              // Remove extra spaces
                    .replace(/\s+/g, '-') // Replace spaces with dashes
                    .replace(/[^a-z0-9-]/g, ''); // Remove special characters
            };

            const slug = generateSlug(title);

            const stateData = {
                title: sanitizedTitle || 'untitled state',
                slug: slug || 'untitled-state',
                description: description || '',
                status: status || 'active',
            };

            try {

                const duplicateCheckQuery = updateId
                    ? { title: sanitizedTitle, _id: { $ne: updateId } }
                    : { title: sanitizedTitle };

                const duplicateState = await State.findOne(duplicateCheckQuery);
                if (duplicateState) {
                    return res.status(400).json({ status: false, message: 'Title already exists' });
                }

                if (updateId) {
                    // Update existing state
                    const existingState = await State.findById(updateId);

                    if (!existingState) {
                        return res.status(404).json({ status: false, message: 'State not found' });
                    }

                    // Merge new data into the existing state
                    Object.assign(existingState, stateData);

                    await existingState.save();

                    const createNotificationMessage = {
                        notification: `State "${sanitizedTitle}" has been updated successfully.`,
                        type: 'update',
                        notifyBy: req.body.createdBy,
                        notifyTo: req.body.createdBy, // Assuming createdBy is the user who made the change
                        createdAt: new Date(),
                        url: '/admin/states', // URL for viewing the updated state
                    };

                    // Send the notification
                    createNotification(createNotificationMessage);


                    return res.status(200).json({ status: true, message: 'State updated successfully' });
                } else {
                    // Create a new state
                    const newState = new State({
                        ...stateData,
                        createdBy: stateId || null,
                    });

                    await newState.save();

                    const createNotificationMessage = {
                        notification: `New state "${sanitizedTitle}" has been created successfully.`,
                        type: 'create',
                        notifyBy: createdBy,
                        notifyTo: createdBy,
                        createdAt: new Date(),
                        url: '/admin/states', // Update the URL if necessary
                    };

                    // Send notification
                    createNotification(createNotificationMessage);

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
            console.log("req.body", req.body)
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
            const isAssignedInPackage = await Package.find({ state: { $in: objectIdArray } });
            const isAssignedInTest = await Test.find({ state: { $in: objectIdArray } });
            const isAssignedInExamType = await ExamType.find({ stateId: { $in: objectIdArray } });

            // If any state is assigned in any of these tables, prevent deletion
            let errorMessage = 'State cannot be deleted as it is assigned to:';
            const assignments = [];

            if (isAssignedInPackage.length) {
                assignments.push('Package');
            }
            if (isAssignedInTest.length) {
                assignments.push('Test');
            }
            if (isAssignedInExamType.length) {
                assignments.push('ExamType');
            }

            if (assignments.length) {
                return res.status(400).json({
                    status: false,
                    message: `${errorMessage} ${assignments.join(', ')}.`,
                });
            }


            await State.deleteMany({ _id: { $in: objectIdArray } });

            // Fetch the admin who initiated the deletion
            const admins = await User.findOne({ role: 'admin' });

            if (!admins) {
                return res.status(404).json({ status: false, message: 'Admin not found' });
            }


            // Create a notification for the admin and log it to the console
            const createNotificationMessage = {
                notification: `State have been deleted successfully.`,
                type: 'deletion',
                notifyBy: admins._id,  // Corrected this line
                notifyTo: admins._id,  // Corrected this line
                createdAt: new Date(),
                url: '/admin/states',
            };

            createNotification(createNotificationMessage);
            res.status(200).json({ status: true, message: 'States deleted successfully' });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    }



};

module.exports = stateController;
