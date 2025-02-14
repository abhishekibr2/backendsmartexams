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
                .populate('grade subject');
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

            const test = await Test.findById(testId);

            const attemptNumber = await TestAttempt.countDocuments({
                user: req.user.userId,
                test: testId
            });


            const testAttempt = await TestAttempt.create({
                user: req.user.userId,
                test: testId,
                mode,
                timer,
                duration: parseInt(test.duration || 0),
                attempt: attemptNumber + 1,
            });

            const attemptQuestion = await AttemptQuestion.create({
                testAttemptId: testAttempt._id,
                questionId: test.questionOrder[0]._id,
                isCorrect: false,
                timeInSec: 0,
                status: 'unanswered',
                startTime: new Date(),
                isActive: true
            })

            return res.status(201).json({
                message: 'Test attempt created successfully',
                testAttempt,
                attemptQuestion
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
