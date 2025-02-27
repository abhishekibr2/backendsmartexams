const Subject = require('../../models/subject');
const errorLogger = require('../../../logger');
const mongoose = require('mongoose');
const { isValidObjectId } = require('mongoose');
const { createNotification } = require('../../common/notifications');
const User = require("../../models/Users")
const Package = require("../../models/packageModel")
const Test = require("../../models/test")
const Question = require("../../models/Question")

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

    addUpdateSubjectDetails: async (req, res) => {
        try {
            const { subjectName, createdBy, updateId } = req.body;

            // Sanitize subject name
            const sanitizedSubjectName = subjectName.trim();

            const duplicateCheckQuery = updateId
                ? { subjectName: sanitizedSubjectName, _id: { $ne: updateId } }
                : { subjectName: sanitizedSubjectName };

            const duplicateSubject = await Subject.findOne(duplicateCheckQuery);
            if (duplicateSubject) {
                return res.status(400).json({ status: false, message: 'SubjectName already exists' });
            }

            if (updateId) {
                const existingSubject = await Subject.findById(updateId);

                if (!existingSubject) {
                    return res.status(404).json({ status: false, message: 'SubjectName not found' });
                }

                Object.assign(existingSubject, { subjectName: sanitizedSubjectName });
                await existingSubject.save();
                const createNotificationMessage = {
                    notification: `Subject "${sanitizedSubjectName}" has been updated successfully.`,
                    type: 'update',
                    notifyBy: req.body.createdBy,
                    notifyTo: req.body.createdBy,
                    createdAt: new Date(),
                    url: '/admin/subject', // URL to view updated subject
                };

                // Call the function to create the notification
                createNotification(createNotificationMessage);

                return res.status(200).json({ status: true, message: 'SubjectName updated successfully' });

            } else {
                const newSubject = new Subject({
                    subjectName: sanitizedSubjectName,
                    createdBy: createdBy || null,
                });

                await newSubject.save();
                const createNotificationMessage = {
                    notification: `New subject "${sanitizedSubjectName}" has been added successfully.`,
                    type: 'add',
                    notifyBy: req.body.createdBy,
                    notifyTo: req.body.createdBy,
                    createdAt: new Date(),
                    url: '/admin/subject', // URL to view updated subject
                };

                // Call the function to create the notification
                createNotification(createNotificationMessage);
                return res.status(200).json({ status: true, message: 'SubjectName added successfully' });
            }
        } catch (error) {
            errorLogger('Unexpected error:', error);
            res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    },


    deleteSubject: async (req, res) => {
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
            const isAssignedInPackage = await Package.find({ subjectsInPackage: { $in: objectIdArray } });
            const isAssignedInTest = await Test.find({ subject: { $in: objectIdArray } });
            const isAssignedInQuestion = await Question.find({ subjectId: { $in: objectIdArray } });

            // If any state is assigned in any of these tables, prevent deletion
            let errorMessage = 'Subject cannot be deleted as it is assigned to:';
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

            await Subject.deleteMany({ _id: { $in: objectIdArray } });
            const admins = await User.findOne({ role: 'admin' });

            if (!admins) {
                return res.status(404).json({ status: false, message: 'Admin not found' });
            }

            const createNotificationMessage = {
                notification: `Subject  have been deleted successfully.`,
                // Adjust this to the admin's identifier
                type: 'deletion',
                notifyBy: admins._id,  // Corrected this line
                notifyTo: admins._id,
                createdAt: new Date(),
                url: '/admin/subject',
            };


            createNotification(createNotificationMessage);

            res.status(200).json({ status: true, message: 'Subject deleted successfully' });
        } catch (error) {
            errorLogger(error);
            res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
        }
    },
};

module.exports = subjectController;
