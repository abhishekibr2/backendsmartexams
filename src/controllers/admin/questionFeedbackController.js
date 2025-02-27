const questionFeedbackModel = require("../../models/questionFeedbackModel")
const Question = require("../../models/Question");
const ReportProblem = require('../../models/ReportProblem');
const Test = require("../../models/test");

const questionFeedbackController = {

    addFeedback: async (req, res) => {
        try {
            const { userId, questionFeedback, difficultyFeedback, technicalFeedback, comment, questionId } = req.body.data;

            const newFeedback = new questionFeedbackModel({
                userId,
                questionFeedback,
                difficultyFeedback,
                technicalFeedback,
                comment,
                questionId
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


    getAllQuestionsReport: async (req, res) => {
        try {
            const allowedQuestionTypes = ['multipleChoice', 'multipleResponse', 'trueFalse', 'comprehension'];
            const questions = await Question.aggregate([
                {
                    $match: {
                        questionType: { $in: allowedQuestionTypes },
                        status: 'active',
                        comprehensionId: null
                    }
                },
                {
                    $group: {
                        _id: {
                            topic: "$topic",
                            subTopic: "$subTopic",
                            complexityId: "$complexityId",
                            examTypeId: "$examTypeId",
                            questionType: "$questionType"
                        },
                        totalQuestions: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'complexities',
                        localField: '_id.complexityId',
                        foreignField: '_id',
                        as: 'complexityDetails'
                    }
                },
                {
                    $lookup: {
                        from: 'subjects',
                        localField: '_id.subjectId',
                        foreignField: '_id',
                        as: 'subjectDetails'
                    }
                },
                {
                    $lookup: {
                        from: 'examTypes',
                        localField: '_id.examTypeId',
                        foreignField: '_id',
                        as: 'examTypeDetails'
                    }
                },
                {
                    $project: {
                        topic: "$_id.topic",
                        subTopic: "$_id.subTopic",
                        complexityId: "$_id.complexityId",
                        subjectId: "$_id.subjectId",
                        examTypeId: "$_id.examTypeId",
                        questionType: "$_id.questionType",
                        totalQuestions: 1,
                        complexityLevel: { $arrayElemAt: ["$complexityDetails.complexityLevel", 0] },
                        subjectName: { $arrayElemAt: ["$subjectDetails.subjectName", 0] },
                        examType: { $arrayElemAt: ["$examTypeDetails.examType", 0] },
                        _id: 0
                    }
                }
            ]);

            res.status(200).json({ questions });
        } catch (error) {
            console.error('Error fetching questions:', error);
            res.status(500).json({ message: 'Failed to fetch questions', error: error.message });
        }
    },

    getAllQuestionReportsBugs: async (req, res) => {
        try {
            const { testId } = req.body;
            let query;
            if (testId) {
                query = { testId };
            } else {
                query = {};
            }
            const reportBugs = await ReportProblem.find(query).sort({ createdAt: -1 }).populate('testId', 'testName').populate('questionId', 'questionText').populate('userId', 'name');
            const allTest = await Test.find().select('testName');

            return res.status(200).json({
                success: true,
                data: { reportBugs, allTest },
            });

        } catch (error) {
            console.error('Error fetching reportBugs:', error);
            res.status(500).json({ message: 'Failed to fetch reportBugs', error: error.message });
        }
    }

}

module.exports = questionFeedbackController;
