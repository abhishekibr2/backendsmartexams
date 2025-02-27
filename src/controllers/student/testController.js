const AttemptQuestion = require("../../models/AttemptQuestion");
const Test = require("../../models/test");
const TestAttempt = require("../../models/TestAttempt");

const testController = {
    freeTests: async (req, res) => {
        try {
            const freeTests = await Test
                .find({
                    //  isFree: true,
                    status: 'active'
                })
                .limit(5)
                .populate('grade subject')
                .lean();

            freeTests.map((test) => {
                test.testDescription.map((item) => {
                    const testAttempt = TestAttempt.findOne({ test: item._id, user: req.userId }).sort({ createdAt: '-1' })
                    console.log('testAttempt: ', testAttempt)
                    test.testAttempt = testAttempt;
                })
            })

            res.status(200).json({ success: true, data: freeTests });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    getTestsById: async (req, res) => {
        try {

            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Either testUrl or duplicateTestId is required'
                });
            }
            console.log(id)
            const test = await Test.findById(id);

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

    attemptTest: async (req, res) => {
        try {
            const { testId, mode, timer } = req.body;

            if (!testId || !mode || !timer) {
                return res.status(400).json({ message: 'Bad Request - Missing required fields (testId, mode, or timer)' });
            }

            // Fetch test details
            const test = await Test.findById(testId).populate([
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
                        populate: [
                            { path: 'questionOptions' },
                            { path: 'comprehensionId' }
                        ],
                    },
                },
            ]);

            // Calculate attempt number
            const attemptNumber = await TestAttempt.countDocuments({
                user: req.user.userId,
                test: testId
            });

            // Create test attempt
            const testAttempt = await TestAttempt.create({
                user: req.user.userId,
                test: testId,
                mode,
                timer,
                duration: parseInt(test.duration || 0),
                attempt: attemptNumber + 1,
            });

            // Collect all question IDs
            let questionIds = [];

            const questionsMap = new Map(test.questions.map(q => [q._id.toString(), q]));

            test.questionOrder.forEach(questionId => {
                if (!questionsMap.has(questionId)) {
                    test.comprehensions.forEach(comprehension => {
                        comprehension.questionId.forEach(item => {
                            if (!questionsMap.has(item._id.toString())) {
                                questionsMap.set(item._id.toString(), item);
                            }
                        });
                    });
                }
            });

            questionIds = test.questions.map(q => q._id);
            test.comprehensions.forEach((comprehension) => {
                comprehension.questionId.forEach(item => {
                    questionIds.push(item._id);
                });
            });

            // Insert all AttemptQuestions in bulk
            const attemptQuestionsData = questionIds.map(questionId => ({
                testAttemptId: testAttempt._id,
                questionId: questionId,
                isCorrect: false,
                timeInSec: 0,
                status: 'unanswered',
                startTime: new Date(),
                isActive: true
            }));

            const insertedAttemptQuestions = await AttemptQuestion.insertMany(attemptQuestionsData);
            const attemptQuestionIds = insertedAttemptQuestions.map(aq => aq._id);

            // Update test attempt with inserted attempt questions
            testAttempt.attemptQuestions = attemptQuestionIds;
            await testAttempt.save();

            return res.status(201).json({
                message: 'Test attempt created successfully',
                testAttempt,
                attemptQuestions: insertedAttemptQuestions
            });

        } catch (err) {
            console.error('Error while creating test attempt:', err);

            return res.status(500).json({
                message: 'Internal Server Error - Could not create test attempt',
                error: err.message
            });
        }
    }
}

module.exports = testController
