const catchErrors = require("../../middleware/catchErrors");
const Comprehension = require("../../models/Comprehension");
const Question = require("../../models/Question");

const questionController = {
    questionsGroupByTopic: catchErrors(async (req, res) => {
        try {
            const questionsGroupedByTopic = await Question.aggregate([
                {
                    $match: {
                        comprehensionId: null
                    }
                },
                {
                    $group: {
                        _id: "$topic",
                        topicSlug: { $first: "$topicSlug" },
                        subTopic: {
                            $addToSet: {
                                questionType: "$questionType",
                                comprehensionId: "$comprehensionId",
                                title: "$subTopic",
                                slug: "$subTopicSlug"
                            }
                        },
                        count: { $sum: 1 }
                    }
                }
            ]);

            const comprehensionGroupedByTopic = await Comprehension.aggregate([
                {
                    $group: {
                        _id: "$topic",
                        topicSlug: { $first: "$topicSlug" },
                        subTopic: {
                            $addToSet: {
                                comprehensionId: "$_id",
                                title: "$subTopic",
                                slug: "$subTopicSlug"
                            }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $addFields: { questionType: "comprehension" }
                }
            ]);

            res.status(200).json({ success: true, data: questionsGroupedByTopic, comprehension: comprehensionGroupedByTopic });
        } catch (error) {
            res.status(400).json({
                message: "Failed to retrieve questions",
                error: error.message
            });
        }
    })
}

module.exports = questionController;
