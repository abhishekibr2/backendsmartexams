const Grade = require('../../models/grade');
const errorLogger = require('../../../logger');
const mongoose = require('mongoose');
const { isValidObjectId } = require('mongoose');
const { createNotification } = require('../../common/notifications');
const User = require("../../models/Users")
const Package = require("../../models/packageModel")
const Test = require("../../models/test")
const Question = require("../../models/Question")


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


    addUpdateGradeDetails: async (req, res) => {
        try {
            const { gradeLevel, createdBy, updateId } = req.body;

            // Sanitize gradeLevel
            const sanitizedGradeLevel = gradeLevel.trim().toLowerCase();

            const gradeData = {
                gradeLevel: sanitizedGradeLevel || 'untitled grade level',
            };

            const duplicateCheckQuery = updateId
                ? { gradeLevel: sanitizedGradeLevel, _id: { $ne: updateId } }
                : { gradeLevel: sanitizedGradeLevel };

            const duplicateGrade = await Grade.findOne(duplicateCheckQuery);
            if (duplicateGrade) {
                return res.status(400).json({ status: false, message: 'Grade already exists' });
            }

            if (updateId) {
                // Update existing Grade
                const existingGrade = await Grade.findById(updateId);

                if (!existingGrade) {
                    return res.status(404).json({ status: false, message: 'Grade not found' });
                }

                // Merge new data into the existing Grade
                Object.assign(existingGrade, gradeData);

                await existingGrade.save();

                const updateNotification = {
                    notification: `Grade "${sanitizedGradeLevel}" has been updated successfully.`,
                    type: 'update',
                    notifyBy: createdBy,
                    notifyTo: createdBy, // Assuming createdBy is the user who made the change
                    createdAt: new Date(),
                    url: '/admin/grade', // Update the URL if necessary
                };

                // Call the function to create the notification
                createNotification(updateNotification);

                return res.status(200).json({ status: true, message: 'Grade updated successfully' });
            } else {
                // Create a new Grade
                const newGrade = new Grade({
                    ...gradeData,
                    createdBy: createdBy || null,
                });

                await newGrade.save();

                const createNotificationMessage = {
                    notification: `Grade "${sanitizedGradeLevel}" has been created successfully.`,
                    type: 'create',
                    notifyBy: createdBy,
                    notifyTo: createdBy,
                    createdAt: new Date(),
                    url: '/admin/grade', // Update the URL if necessary
                };

                // Call the function to create the notification
                createNotification(createNotificationMessage);

                return res.status(200).json({ status: true, message: 'Grade added successfully' });
            }
        } catch (error) {
            errorLogger('Unexpected error:', error);
            res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    },

    deleteGrade: async (req, res) => {
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
            const isAssignedInPackage = await Package.find({ grade: { $in: objectIdArray } });
            const isAssignedInTest = await Test.find({ grade: { $in: objectIdArray } });
            const isAssignedInQuestion = await Question.find({ gradeId: { $in: objectIdArray } });

            // If any state is assigned in any of these tables, prevent deletion
            let errorMessage = 'Grade cannot be deleted as it is assigned to:';
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
            await Grade.deleteMany({ _id: { $in: objectIdArray } });

            const admins = await User.findOne({ role: 'admin' });

            if (!admins) {
                return res.status(404).json({ status: false, message: 'Admin not found' });
            }

            const createNotificationMessage = {
                notification: `Grade  have been deleted successfully.`,
                // Adjust this to the admin's identifier
                type: 'deletion',
                notifyBy: admins._id,  // Corrected this line
                notifyTo: admins._id,
                createdAt: new Date(),
                url: '/admin/grade',
            };



            createNotification(createNotificationMessage);

            res.status(200).json({ status: true, message: 'Grade deleted successfully' });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    },
};

module.exports = gradeController;
