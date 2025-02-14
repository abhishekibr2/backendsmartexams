const { catchErrors } = require("../../helper/errorHandler");
const AttemptQuestion = require("../../models/AttemptQuestion");
const Question = require("../../models/Question");
const TestAttempt = require("../../models/TestAttempt");

const testAttemptController = {
    createTestAttempt: async (req, res) => {
        try {
            const attemptNumber = TestAttempt.find({
                userId: req.user._id,
                testId: req.body.testId
            }).countDocuments();

            const newTestAttempt = await TestAttempt.create({
                userId: req.user._id,
                testId: req.body.testId,
                duration: req.body.duration,
                attempt: attemptNumber + 1,
                startTime: new Date(),
                status: 'in-progress'
            });

            res.status(201).json({ status: true, data: newTestAttempt });
        } catch (error) {
            res.status(500).json({ status: false, message: 'Failed to create test attempt' });
        }
    },

    allQuestionAttempts: async (req, res) => {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({ status: false, message: 'Test attempt ID is required' });
            }

            const questionAttempts = await AttemptQuestion.find({ testAttemptId: id });

            if (!questionAttempts || questionAttempts.length === 0) {
                return res.status(404).json({ status: false, message: 'No question attempts found for the given test attempt ID' });
            }

            return res.status(200).json({ status: true, data: questionAttempts });
        } catch (error) {
            console.error('Error fetching question attempts:', error);
            return res.status(500).json({ status: false, message: 'An error occurred while fetching question attempts' });
        }
    },

    getAttemptQuestion: async (req, res) => {
        try {
            const { questionAttemptId, testAttemptId } = req.query;

            if (!questionAttemptId || !testAttemptId) {
                return res.status(400).json({
                    status: false,
                    message: 'Missing required query parameters: questionAttemptId or testAttemptId',
                });
            }

            const testAttempt = await TestAttempt.findById(testAttemptId).populate('test');

            if (!testAttempt) {
                return res.status(404).json({
                    status: false,
                    message: 'Test attempt not found',
                });
            }

            const questionAttempt = await AttemptQuestion
                .findById(questionAttemptId)
                .populate('questionId')
                .populate({
                    path: 'questionId',
                    populate: {
                        path: 'questionOptions',
                    },
                });

            if (!questionAttempt) {
                return res.status(404).json({
                    status: false,
                    message: 'Question attempt not found',
                });
            }

            const currentQuestionId = questionAttempt.questionId._id.toString();
            const questionOrder = testAttempt.test.questionOrder;
            const currentIndex = questionOrder.findIndex((_id) => _id.toString() === currentQuestionId);
            let previousQuestionAttempt = null;

            if (currentIndex > 0) {
                const previousQuestionId = questionOrder[currentIndex - 1];

                previousQuestionAttempt = await AttemptQuestion
                    .findOne({ questionId: previousQuestionId, testAttemptId: testAttemptId })
                    .populate('questionId')
                    .populate({
                        path: 'questionId',
                        populate: {
                            path: 'questionOptions',
                        },
                    });
            }

            res.status(200).json({
                status: true,
                data: {
                    testAttempt,
                    questionAttempt,
                    previousQuestionAttempt,
                },
            });
        } catch (error) {
            console.error('Error fetching attempt question:', error);
            res.status(500).json({
                status: false,
                message: 'Failed to get question for test attempt',
                error: error.message,
            });
        }
    },

    createQuestionAttempt: async (req, res) => {
        try {
            const { testAttemptId, questionId } = req.params;
            const attemptQuestion = await AttemptQuestion.create({
                testAttemptId: testAttemptId,
                questionId: questionId,
                isCorrect: false,
                timeInSec: 0,
                status: 'unanswered',
                isActive: true
            })

            return res.status(201).json(attemptQuestion)
        } catch (error) {
            console.error('Error fetching attempt question:', error);
            res.status(500).json({
                status: false,
                message: 'Failed to get question for test attempt',
                error: error.message,
            });
        }

    },

    answerQuestion: catchErrors(async (req, res) => {
        const { answerId, questionId, testAttemptId, status, isFlagged } = req.body;

        const answer = await Question.findById(questionId).populate('questionOptions').select('questionOptions');

        if (!answer || !answer.questionOptions) {
            return res.status(404).json({ status: false, message: 'Answer options not found' });
        }

        const isCorrect = answer.questionOptions
            .filter((item) => item.isCorrect === true)
            .map((item) => item._id.toString());

        if (!isCorrect.length) {
            return res.status(404).json({ status: false, message: 'Correct answer not found' });
        }

        const isAnswerCorrect = answerId && isCorrect.some(id => id.toString() === answerId.toString());

        let questionAttempt = await AttemptQuestion.findOneAndUpdate(
            { questionId, testAttemptId },
            {
                $set: {
                    answerId,
                    status,
                    isCorrect: isAnswerCorrect,
                    isFlagged,
                    updatedAt: new Date(),
                    endTime: new Date()
                }
            },
            { new: true, upsert: true }
        );

        const testAttempt = await TestAttempt.findByIdAndUpdate(
            questionAttempt.testAttemptId,
            { attemptQuestions: questionAttempt._id },
            { new: true }
        ).populate('test');

        const currentIndex = testAttempt.test.questionOrder.indexOf(questionAttempt.questionId);
        const nextQuestionId = currentIndex !== -1 && currentIndex + 1 < testAttempt.test.questionOrder.length
            ? testAttempt.test.questionOrder[currentIndex + 1]
            : null;

        if (nextQuestionId) {
            await AttemptQuestion.findOneAndUpdate(
                { testAttemptId: questionAttempt.testAttemptId, questionId: nextQuestionId },
                {
                    $setOnInsert: {
                        testAttemptId: questionAttempt.testAttemptId,
                        questionId: nextQuestionId,
                        isCorrect: false,
                        timeInSec: 0,
                        status: 'unanswered',
                        isActive: true,
                        startTime: new Date()
                    }
                },
                { upsert: true }
            );
        }

        res.status(201).json(questionAttempt);
    }),

    updateQuestionAttempt: async (req, res) => {
        try {
            const { answer, attemptQuestionId, status, isCorrect = false, isFlagged } = req.body;
            const updatedQuestionAttempt = await AttemptQuestion
                .findByIdAndUpdate(attemptQuestionId,
                    {
                        answerId: answer,
                        isActive: false,
                        status: status,
                        isCorrect: isCorrect,
                        isFlagged
                    },
                    {
                        new: true
                    });
            const testAttempt = await TestAttempt.findByIdAndUpdate(updatedQuestionAttempt.testAttemptId, {
                attemptQuestions: attemptQuestionId
            })
                .populate('test');

            const currentIndex = testAttempt.test.questionOrder.indexOf(updatedQuestionAttempt.questionId);

            const nextQuestionId = currentIndex !== -1 && currentIndex + 1 < testAttempt.test.questionOrder.length
                ? testAttempt.test.questionOrder[currentIndex + 1]
                : null;

            const nextAttemptQuestion = await AttemptQuestion.create({
                testAttemptId: updatedQuestionAttempt.testAttemptId,
                questionId: nextQuestionId,
                isCorrect: false,
                timeInSec: 0,
                status: 'unanswered',
                isActive: true
            })

            if (!updatedQuestionAttempt) {
                return res.status(404).json({
                    status: false,
                    message: 'Question attempt not found'
                });
            }

            return res.status(200).json({
                status: true,
                data: {
                    updatedQuestionAttempt,
                    testAttempt,
                    nextAttemptQuestion
                }
            });

        } catch (error) {
            console.error('Error fetching attempt question:', error);
            res.status(500).json({
                status: false,
                message: 'Failed to get question for test attempt',
                error: error.message,
            });
        }

    },

    goToQuestionAttempt: catchErrors(async (req, res) => {
        const { targetQuestionId, testAttemptId, questionAttemptId, currentQuestionId } = req.query;

        const test = await TestAttempt.findById(testAttemptId)
            .populate('test')
            .select('test');

        const questionOrder = test.test.questionOrder;

        const currentIndex = questionOrder.indexOf(currentQuestionId);
        const targetIndex = questionOrder.indexOf(targetQuestionId);

        if (currentIndex === -1 || targetIndex === -1) {
            return res.status(400).json({ error: 'Invalid question IDs' });
        }

        const [startIndex, endIndex] = currentIndex < targetIndex
            ? [currentIndex, targetIndex]
            : [targetIndex, currentIndex];

        let targetAttemptQuestion = null;

        for (let i = startIndex; i <= endIndex; i++) {
            const questionId = questionOrder[i];

            let attemptQuestion = await AttemptQuestion.findOne({
                questionId,
                testAttemptId
            });

            if (!attemptQuestion) {
                attemptQuestion = await AttemptQuestion.create({
                    testAttemptId: testAttemptId,
                    questionId: questionId,
                    isCorrect: false,
                    timeInSec: 0,
                    status: 'notVisited',
                    isActive: i === endIndex
                });
            } else {
                await AttemptQuestion.findByIdAndUpdate(attemptQuestion._id, {
                    isActive: i === endIndex,
                });
            }

            if (questionId == targetQuestionId) {
                // eslint-disable-next-line no-unused-vars
                targetAttemptQuestion = attemptQuestion;
            }
        }

        if (questionAttemptId) {
            await AttemptQuestion.findByIdAndUpdate(questionAttemptId, {
                isActive: false,
                status: 'unanswered'
            });
        }

        res.status(201).json({ message: 'Records updated successfully', data: targetAttemptQuestion });
    }),

    testAttempt: catchErrors(async (req, res) => {
        const { id } = req.params;

        const testAttempt = await TestAttempt.findById(id)
            .populate({
                path: 'test',
                populate: [
                    {
                        path: 'questions',
                        populate: [
                            { path: 'questionOptions' },
                            { path: 'complexityId' },
                        ],
                    },
                    {
                        path: 'comprehensions',
                        populate: {
                            path: 'questionId',
                            populate: 'questionOptions',
                        },
                    },
                ],
            });

        const questionAttempts = await AttemptQuestion
            .find({ testAttemptId: id })
            .populate({
                path: 'questionId',
                populate: 'complexityId',
                select: 'complexityId topic subTopic'
            });

        return res.status(201).json({ testAttempt, questionAttempts });
    }),

    completeTest: catchErrors(async (req, res) => {
        const { id } = req.params;
        const { status = 'completed' } = req.query;

        // Find the test attempt by id to access the startTime
        const testAttempt = await TestAttempt.findById(id);

        if (!testAttempt) {
            return res.status(404).json({
                status: false,
                message: 'Test attempt not found'
            });
        }

        // Ensure startTime exists before proceeding
        if (!testAttempt.startTime) {
            return res.status(400).json({
                status: false,
                message: 'Start time is missing in the test attempt'
            });
        }

        const startTime = testAttempt.startTime;
        const endTime = new Date();
        const timeTakenInMilliseconds = endTime - startTime;
        const timeTakenInSeconds = timeTakenInMilliseconds / 1000;
        const timeTakenInMinutes = timeTakenInSeconds / 60;

        const updatedTestAttempt = await TestAttempt.findByIdAndUpdate(id, {
            $set: {
                isCompleted: true,
                endTime: endTime,
                timeTaken: timeTakenInMinutes,
                status: status
            }
        }, { new: true });

        return res.status(201).json({
            status: true,
            message: 'Test attempt completed successfully',
            testAttempt: updatedTestAttempt
        });
    }),

    testResult: catchErrors(async (req, res) => {
        try {
            const testAttempt = await TestAttempt.find({
                user: req.user.userId
            })
                .populate({
                    path: 'test',
                    populate: [
                        {
                            path: 'questions',
                            populate: [
                                { path: 'questionOptions' },
                                { path: 'complexityId' },
                            ],
                        },
                        {
                            path: 'comprehensions',
                            populate: {
                                path: 'questionId',
                                populate: 'questionOptions',
                            },
                        },
                    ],
                })
                .populate('attemptQuestions');


            return res.status(201).json({
                status: true,
                message: 'Test result fetched successfully',
                result: testAttempt
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                status: false,
                message: 'Something went wrong',
                error: error.message,
            });
        }
    })

}

module.exports = testAttemptController;
