const ExamType = require('../../models/examType');
const errorLogger = require('../../../logger');
const mongoose = require('mongoose');
const { isValidObjectId } = require('mongoose');
const { createNotification } = require('../../common/notifications');
const User = require("../../models/Users")
const Package = require("../../models/packageModel")
const Test = require("../../models/test")
const Question = require("../../models/Question")

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

    addUpdateExamTypeDetails: async (req, res) => {
        try {
            // const { examType, createdBy, updateId } = req.body;
            const { examType, createdBy, updateId, stateId, complexityId, eligibility, duration, onlineAvailability, testSubjects } = req.body;

            // Sanitize the examType by trimming and converting to lowercase
            const sanitizedExamType = examType.trim();

            const generateSlug = (name) => {
                return name
                    .toLowerCase()       // Convert to lowercase
                    .trim()              // Remove extra spaces
                    .replace(/\s+/g, '-') // Replace spaces with dashes
                    .replace(/[^a-z0-9-]/g, ''); // Remove special characters
            };

            const slug = generateSlug(sanitizedExamType)

            const ExamTypeData = {
                examType: sanitizedExamType || 'Untitled State', // Ensure default if missing
                slug: slug || 'untitled-state',
                stateId,
                complexityId,
                eligibility,
                duration,
                onlineAvailability,
                testSubjects
            };

            try {

                const duplicateCheckQuery = updateId
                    ? {
                        slug: { $regex: new RegExp(`^${slug}$`, 'i') }, // Match slug exactly, case-insensitive
                        stateId,  // Check for duplicates in the same state
                        _id: { $ne: updateId }  // Exclude the current record
                    }
                    : {
                        slug: { $regex: new RegExp(`^${slug}$`, 'i') }, // Match slug exactly, case-insensitive
                        stateId  // Check for duplicates in the same state
                    };

                const duplicateExamType = await ExamType.findOne(duplicateCheckQuery);
                if (duplicateExamType) {
                    return res.status(400).json({ status: false, message: 'ExamType already exists' });
                }

                if (updateId) {
                    // Update existing ExamType
                    const existingExamType = await ExamType.findById(updateId);

                    if (!existingExamType) {
                        return res.status(404).json({ status: false, message: 'ExamType not found' });
                    }

                    // Merge new data into the existing ExamType
                    Object.assign(existingExamType, ExamTypeData);

                    await existingExamType.save();

                    const createNotificationMessage = {
                        notification: `Exam Type "${sanitizedExamType}" has been updated successfully.`,
                        type: 'update',
                        notifyBy: req.body.createdBy,
                        notifyTo: req.body.createdBy,  // Assuming createdBy is the user who made the change
                        createdAt: new Date(),
                        url: '/admin/examType',  // Update the URL if necessary
                    };

                    // Call the function to create the notification (send it to the relevant user)
                    createNotification(createNotificationMessage);

                    return res.status(200).json({ status: true, message: 'ExamType updated successfully' });
                } else {
                    // Create a new ExamType
                    const newExamType = new ExamType({
                        ...ExamTypeData,
                        createdBy: createdBy || null,
                    });

                    await newExamType.save();

                    const createNotificationMessage = {
                        notification: `Exam Type "${sanitizedExamType}" has been created successfully.`,
                        type: 'create',
                        notifyBy: req.body.createdBy,
                        notifyTo: req.body.createdBy,
                        createdAt: new Date(),
                        url: '/admin/examType',  // Update the URL if necessary
                    };

                    // Call the function to create the notification (send it to the relevant user)
                    createNotification(createNotificationMessage);

                    return res.status(200).json({ status: true, message: 'ExamType added successfully' });
                }

            } catch (error) {
                errorLogger('Error processing ExamType:', error);
                return res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
            }
        } catch (error) {
            errorLogger('Unexpected error:', error);
            res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    },

    deleteExamType: async (req, res) => {
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
            const isAssignedInPackage = await Package.find({ examType: { $in: objectIdArray } });
            const isAssignedInTest = await Test.find({ examType: { $in: objectIdArray } });
            const isAssignedInQuestion = await Question.find({ examTypeId: { $in: objectIdArray } });

            // If any state is assigned in any of these tables, prevent deletion
            let errorMessage = 'ExamType cannot be deleted as it is assigned to:';
            const assignments = [];

            if (isAssignedInPackage.length) {
                assignments.push('Package');
            }
            if (isAssignedInTest.length) {
                assignments.push('Test');
            }
            if (isAssignedInQuestion.length) {
                assignments.push('Question');
            }

            if (assignments.length) {
                return res.status(400).json({
                    status: false,
                    message: `${errorMessage} ${assignments.join(', ')}.`,
                });
            }
            await ExamType.deleteMany({ _id: { $in: objectIdArray } });

            const admins = await User.findOne({ role: 'admin' });

            if (!admins) {
                return res.status(404).json({ status: false, message: 'Admin not found' });
            }

            const createNotificationMessage = {
                notification: `Exam Type  have been deleted successfully.`,
                // Adjust this to the admin's identifier
                type: 'deletion',
                notifyBy: admins._id,  // Corrected this line
                notifyTo: admins._id,
                createdAt: new Date(),
                url: '/admin/examType',
            };


            createNotification(createNotificationMessage);

            res.status(200).json({ status: true, message: 'ExamType deleted successfully' });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    },
};

module.exports = examTypeController;
