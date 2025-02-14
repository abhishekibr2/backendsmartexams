const testModel = require("../../models/testFeedback")
const testFeedbackController = {


    addFeedback: async (req, res) => {
        try {
            const { userId, questionFeedback, difficultyFeedback, technicalFeedback, comment, testId } = req.body.data;

            const newFeedback = new testModel({
                userId,
                questionFeedback,
                difficultyFeedback,
                technicalFeedback,
                comment,
                testId
            });

            const savedFeedback = await newFeedback.save();
            res.status(201).json({
                message: 'Feedback submitted successfully!',
                feedback: savedFeedback
            });
        } catch (error) {
            console.error('Error submitting feedback:', error);
            res.status(400).json({ message: 'Error submitting feedback', error: error.message });
        }
    },
}


module.exports = testFeedbackController;
