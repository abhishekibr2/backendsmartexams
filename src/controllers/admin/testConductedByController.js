const TestConduct = require('../../models/testConductedBy');
const errorLogger = require('../../../logger');
const mongoose = require('mongoose');
const { isValidObjectId } = require('mongoose');
const { createNotification } = require('../../common/notifications');
const User = require("../../models/Users")
const Package = require("../../models/packageModel")
const Test = require("../../models/test")


const testConductedByController = {
    getAllTestConduct: async (req, res) => {
        try {
            const testConduct = await TestConduct.find().sort({ _id: -1 });
            res.status(200).json({ status: true, data: testConduct });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    addUpdateTestConductDetails: async (req, res) => {
        try {
            const { name, createdBy, updateId } = req.body;

            // Sanitize the name
            const sanitizedName = name.trim();

            // Validation for duplicate name
            const duplicateCheckQuery = updateId
                ? { name: sanitizedName, _id: { $ne: updateId } }
                : { name: sanitizedName };

            const duplicateTestConduct = await TestConduct.findOne(duplicateCheckQuery);
            if (duplicateTestConduct) {
                return res.status(400).json({ status: false, message: 'TestConduct already exists' });
            }

            const testConductData = {
                name: sanitizedName || 'Untitled TestConduct',
            };

            if (updateId) {
                // Update existing TestConduct
                const existingTestConduct = await TestConduct.findById(updateId);

                if (!existingTestConduct) {
                    return res.status(404).json({ status: false, message: 'TestConduct not found' });
                }

                // Merge new data into the existing TestConduct
                Object.assign(existingTestConduct, testConductData);

                await existingTestConduct.save();

                const createNotificationMessage = {
                    notification: `TestConduct "${sanitizedName}" has been updated successfully.`,
                    type: 'update',
                    notifyBy: createdBy,
                    notifyTo: createdBy,
                    createdAt: new Date(),
                    url: '/admin/testConduct', // URL to view updated test conduct
                };

                // Call the function to create the notification (send it to the relevant user)
                createNotification(createNotificationMessage);

                return res.status(200).json({ status: true, message: 'TestConduct updated successfully' });
            } else {
                // Create a new TestConduct
                const newTestConduct = new TestConduct({
                    ...testConductData,
                    createdBy: createdBy || null,
                });

                await newTestConduct.save();

                const createNotificationMessage = {
                    notification: `New TestConduct "${sanitizedName}" has been created successfully.`,
                    type: 'create',
                    notifyBy: createdBy,
                    notifyTo: createdBy,
                    createdAt: new Date(),
                    url: '/admin/testConduct',  // URL to view the new test conduct
                };

                // Call the function to create the notification (send it to the relevant user)
                createNotification(createNotificationMessage);

                return res.status(200).json({ status: true, message: 'TestConduct added successfully' });
            }
        } catch (error) {
            errorLogger('Unexpected error:', error);
            return res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    },

    deleteTestConduct: async (req, res) => {
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
            const isAssignedInPackage = await Package.find({ testConductedBy: { $in: objectIdArray } });
            const isAssignedInTest = await Test.find({ testConductedBy: { $in: objectIdArray } });

            // If any state is assigned in any of these tables, prevent deletion
            let errorMessage = 'TestConduct cannot be deleted as it is assigned to:';
            const assignments = [];

            if (isAssignedInPackage.length) {
                assignments.push('Package');
            }
            if (isAssignedInTest.length) {
                assignments.push('Test');
            }

            if (assignments.length) {
                return res.status(400).json({
                    status: false,
                    message: `${errorMessage} ${assignments.join(', ')}.`,
                });
            }
            await TestConduct.deleteMany({ _id: { $in: objectIdArray } });

            const admins = await User.findOne({ role: 'admin' });

            if (!admins) {
                return res.status(404).json({ status: false, message: 'Admin not found' });
            }

            const createNotificationMessage = {
                notification: `Test Conduct  have been deleted successfully.`,
                // Adjust this to the admin's identifier
                type: 'deletion',
                notifyBy: admins._id,  // Corrected this line
                notifyTo: admins._id,
                createdAt: new Date(),
                url: '/admin/testConduct',
            };


            createNotification(createNotificationMessage);

            res.status(200).json({ status: true, message: 'Test Conduct deleted successfully' });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    },
};

module.exports = testConductedByController;
