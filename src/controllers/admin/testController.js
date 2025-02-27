const Question = require("../../models/Question");
const Test = require("../../models/test");
const Package = require("../../models/packageModel");
const catchErrors = require("../../middleware/catchErrors");
const ReportProblem = require("../../models/ReportProblem");
const TestAttemptFeedback = require("../../models/testAttemptFeedBack");

const mongoose = require('mongoose');

const testController = {
    createTest: async (req, res) => {
        try {
            if (req.body.duplicateTestId) {
                const newTest = new Test(req.body);
                const savedTest = await newTest.save();

                const package = await Package.findById(savedTest.packageName);
                if (package) {
                    package.tests.addToSet(savedTest._id);
                    await package.save();
                }

                return res.status(201).json({
                    success: true,
                    message: 'Test duplicated and created successfully',
                    data: savedTest,
                });
            }

            if (req.body.testId) {
                const existingTest = await Test.findById(req.body.testId);
                if (!existingTest) {
                    return res.status(404).json({
                        success: false,
                        message: 'Test not found',
                    });
                }
                if (existingTest.questionOrder.length > parseInt(req.body.maxQuestions)) {
                    return res.status(400).json({
                        success: false,
                        message: 'The number of questions in the test cannot exceed the maximum allowed.'
                    });
                }
                const updatedTest = await Test.findByIdAndUpdate(req.body.testId, req.body, { new: true });
                const oldPackageId = req.body.oldPackageId;

                if (oldPackageId) {
                    const oldPackage = await Package.findById(oldPackageId);
                    if (oldPackage) {
                        oldPackage.tests = oldPackage.tests.filter(test => test.toString() !== req.body.testId);
                        await oldPackage.save();
                    }
                }

                if (req.body.packageName) {
                    const package = await Package.findById(req.body.packageName);
                    if (package) {
                        package.tests.addToSet(updatedTest._id);
                        await package.save();
                    }
                }

                return res.status(200).json({
                    success: true,
                    message: 'Test updated successfully',
                    data: updatedTest,
                });
            }

            const newTest = new Test(req.body);
            const savedTest = await newTest.save();
            const testId = savedTest._id;

            const package = await Package.findById(savedTest.packageName);
            if (package) {
                package.tests.addToSet(testId);
                await package.save();
            }

            return res.status(201).json({
                success: true,
                message: 'Test created successfully',
                data: savedTest,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error',
                error: error.message,
            });
        }
    },

    getAllTests: async (req, res) => {
        try {
            let { page = 1, limit = 10, orderBy = 'newest', ...query } = req.query;

            page = parseInt(page, 10);
            limit = parseInt(limit, 10);

            Object.keys(query).forEach((key) => {
                if (query[key] === '' || query[key] === null || query[key] === undefined) {
                    delete query[key];
                }
            });

            if (query.testName) {
                query.testName = { $regex: new RegExp(query.testName, 'i') };
            }
            if (query.packageName) {
                query.packageName = new mongoose.Types.ObjectId(query.packageName);
            }

            const totalTests = await Test.countDocuments(query);

            const order = orderBy === "newest" ? -1 : 1;

            const tests = await Test.find(query)
                .populate("subject packageName testConductedBy state")
                .sort({ createdAt: order })
                .skip((page - 1) * limit)
                .limit(limit);

            return res.status(200).json({
                success: true,
                message: 'Tests retrieved successfully',
                data: tests,
                pagination: {
                    total: totalTests,
                    page,
                    limit,
                    totalPages: Math.ceil(totalTests / limit),
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while retrieving the tests',
                error: error.message,
            });
        }
    },

    getTestsById: async (req, res) => {
        try {

            const { testUrl, duplicateTestId, } = req.body;
            if (!testUrl && !duplicateTestId) {
                return res.status(400).json({
                    success: false,
                    message: 'Either testUrl or duplicateTestId is required'
                });
            }

            let test;

            if (testUrl) {
                test = await Test.findOne({ _id: testUrl });
            }

            if (!test && duplicateTestId) {
                test = await Test.findById(duplicateTestId);
            }

            if (!test) {
                return res.status(404).json({
                    success: false,
                    message: 'Test not found'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Test retrieved successfully',
                data: test
            });

        } catch (error) {
            console.error('Error retrieving test:', error);

            return res.status(500).json({
                success: false,
                message: 'An error occurred while retrieving the test',
                error: error.message
            });
        }
    },

    deleteTest: async (req, res) => {
        try {

            const { testId } = req.body;
            if (!testId) {
                return res.status(400).json({
                    success: false,
                    message: 'Test testId is required'
                });
            }

            const deletedTest = await Test.findByIdAndDelete(testId);
            if (!deletedTest) {
                return res.status(404).json({
                    success: false,
                    message: 'Test not found'
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Test deleted successfully'
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while deleting the test',
                error: error.message
            });
        }
    },

    assignQuestions: async (req, res) => {
        try {
            const { testIds, questionId, questionType } = req.body;

            if (!Array.isArray(testIds) || !testIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'testIds must be a non-empty array.',
                });
            }

            if (!questionId) {
                return res.status(400).json({
                    success: false,
                    message: 'questionId is required.',
                });
            }

            const tests = await Test.find({ _id: { $in: testIds } });

            const testsExceedingMaxQuestions = tests.filter(test =>
                test.questionOrder.length >= test.maxQuestions
            );

            if (testsExceedingMaxQuestions.length > 0) {
                return res.status(200).json({
                    success: false,
                    message: 'Test have reached the maximum number of questions.',
                    data: testsExceedingMaxQuestions.map(test => test._id),
                });
            }

            let updatedTests;

            if (questionType !== 'comprehension') {
                updatedTests = await Test.updateMany(
                    { _id: { $in: testIds } },
                    { $addToSet: { questions: questionId, questionOrder: questionId } }
                );
            } else {
                updatedTests = await Test.updateMany(
                    { _id: { $in: testIds } },
                    { $addToSet: { comprehensions: questionId, questionOrder: questionId } }
                );
            }

            return res.status(200).json({
                success: true,
                message: 'Question added successfully.',
                data: updatedTests,
            });
        } catch (error) {
            console.error('Error assigning question:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while assigning the question.',
                error: error.message,
            });
        }
    },

    removeQuestion: async (req, res) => {
        try {
            const { testIds, questionId } = req.body;

            if (!Array.isArray(testIds) || !testIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'testIds must be a non-empty array.',
                });
            }

            if (!questionId) {
                return res.status(400).json({
                    success: false,
                    message: 'questionId is required.',
                });
            }

            let updatedTests;

            updatedTests = await Test.updateMany(
                { _id: { $in: testIds } },
                { $pull: { questions: questionId, comprehensions: questionId, questionOrder: questionId } }
            );

            return res.status(200).json({
                success: true,
                message: 'Question removed successfully.',
                data: updatedTests,
            });
        } catch (error) {
            console.error('Error removing question:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while removing the question.',
                error: error.message,
            });
        }
    },

    testQuestions: async (req, res) => {
        try {
            const { id } = req.params;

            const test = await Test.findById(id)
                .populate({
                    path: 'questions',
                    populate: {
                        path: 'questionOptions',
                        model: 'QuestionOption',
                    },
                })
                .populate({
                    path: 'comprehensions',
                    populate: {
                        path: 'questionId',
                        model: 'Question',
                        populate: {
                            path: 'questionOptions',
                            model: 'QuestionOption',
                        },
                    },
                })
                .populate({
                    path: 'subject',
                    model: 'subject',
                })
                // .populate({
                //     path: 'grade',
                //     model: 'grade',
                // })
                .populate({
                    path: 'examType',
                    model: 'examType',
                }).populate({
                    path: 'packageName',
                    model: 'Package',
                }).populate({
                    path: 'state',
                    model: 'state',
                })
                .lean();

            if (!test) {
                return res.status(404).json({
                    success: false,
                    message: 'Test not found.',
                });
            }

            const questionCount = await Question.countDocuments();

            const orderedQuestions = [];
            if (test.questionOrder) {
                for (const id of test.questionOrder || []) {
                    const question = test.questions.find(q => q._id.toString() === id.toString()) ||
                        test.comprehensions.find(c => c._id.toString() === id.toString());
                    if (question) orderedQuestions.push(question);
                }
            } else {
                orderedQuestions.push(...test.questions, ...test.comprehensions);
            }

            let totalAddedQuestion = test.questions.length;

            test.questions.length + test.comprehensions.map((item) => {
                totalAddedQuestion += item.questionId.length
            })
            test.questions = orderedQuestions;
            test.questionCount = questionCount;
            test.totalAddedQuestion = totalAddedQuestion;

            return res.status(200).json({
                success: true,
                message: 'Test questions retrieved successfully.',
                data: test,
            });
        } catch (error) {
            console.error('Error retrieving test questions:', error);

            return res.status(500).json({
                success: false,
                message: 'An error occurred while retrieving test questions.',
                error: error.message,
            });
        }
    },

    reorderQuestion: async (req, res) => {
        try {
            const { order } = req.body;
            const { id } = req.params;

            if (!order || !Array.isArray(order)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid input: testId and order are required, and order must be an array.',
                });
            }

            const test = await Test.findByIdAndUpdate(
                id,
                { $set: { questionOrder: order } },
                { new: true }
            );

            if (!test) {
                return res.status(404).json({
                    success: false,
                    message: 'Test not found.',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Test order updated successfully.',
                data: test,
            });

        } catch (error) {
            console.error('Error updating test order:', error);

            return res.status(500).json({
                success: false,
                message: 'An error occurred while updating test order.',
                error: error.message,
            });
        }
    },

    updatePublishPackage: catchErrors(async (req, res) => {
        const { id, value } = req.body;
        const test = await Test.findById(id)
            .populate('questions');

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        if (!test.qualityChecked) {
            return res.status(400).json({ message: 'Cannot update test information while quality check is not completed' });
        }

        const testCompleted = test.questionOrder.length === test.maxQuestions

        if (!testCompleted) {
            return res.status(400).json({ message: 'Cannot update test information while test is in progress' });
        }
        test.isPublished = value;
        await test.save();

        return res.status(201).json({ id, value, test })
    }),

    updateQualityChecked: catchErrors(async (req, res) => {
        const { id, value } = req.body;
        const test = await Test.findById(id);

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        test.qualityChecked = value;
        if (!value) {
            test.isPublished = value;
        }
        await test.save();

        return res.status(200).json({ id, value, test });
    }),

    reportProblem: catchErrors(async (req, res) => {
        const { testId, userId, issueType, description, questionId } = req.body;

        const newReport = new ReportProblem({
            testId,
            userId,
            issueType,
            description,
            questionId,
        });

        await newReport.save();

        return res.status(200).json({
            success: true,
            message: 'Your report has been submitted successfully!',
            data: newReport,
        });
    }),

    getAllTestFeedback: catchErrors(async (req, res) => {
        try {
            const { testId } = req.body;
            let query;
            if (testId) {
                query = { testId };
            }
            const testFeedbacks = await TestAttemptFeedback.find(query)
                .sort({ createdAt: -1 })
                .populate('testId', 'testName testDisplayName')
                .populate('testAttemptId').populate('userId', 'name lastName email');
            const allTest = await Test.find().select('testName');
            return res.status(200).json({
                success: true,
                message: 'Test feedback retrieved successfully.',
                data: { testFeedbacks, allTest },
            });
        } catch (error) {
            console.error('Error fetching test feedback:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while fetching test feedback.',
                error: error.message,
            });
        }
    })

};

module.exports = testController;
