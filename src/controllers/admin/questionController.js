const mongoose = require('mongoose')
const Question = require("../../models/Question");
const Comprehension = require("../../models/Comprehension");
const QuestionOption = require("../../models/QuestionOption");
const { createUpload } = require("../../utils/multerConfig");
const catchErrors = require('../../middleware/catchErrors');
const errorLogger = require('../../../logger');
const Test = require("../../models/test");

const createOrUpdateQuestion = async (req, res) => {
    try {
        const {
            questionId,
            multipleResponse,
            booleanFields,
            trueFalse,
            multipleChoice,
            options,
            comprehension,
            testId
        } = req.body;

        const tests = await Test.find({ _id: { $in: [testId] } });

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

        const optionData = multipleResponse || booleanFields || multipleChoice || trueFalse || options;
        const userId = req.user;
        const handleOption = async (option) => {
            if (!option.title) return null;

            const htmlContent = option.title;

            if (option._id) {
                return await QuestionOption.findByIdAndUpdate(
                    option._id,
                    {
                        $set: {
                            title: htmlContent,
                            isCorrect: option.isCorrect || false,
                            hasImage: option.hasImage === 'yes'
                        }
                    },
                    { new: true }
                );
            }

            const newOption = new QuestionOption({
                title: htmlContent,
                isCorrect: option.isCorrect || false,
                hasImage: option.hasImage,
            });
            return await newOption.save();
        };

        const createOrUpdateQuestionOptions = async (options) => {
            const promises = options.map(handleOption);
            return (await Promise.all(promises)).filter(Boolean);
        };

        const updateOrCreateComprehension = async (comprehensionData) => {
            if (questionId) {
                return await Comprehension.findByIdAndUpdate(questionId, { $set: comprehensionData }, { new: true });
            }
            return await Comprehension.create(comprehensionData);
        };

        const processComprehensionQuestions = async (comprehension, comprehensionId) => {
            const questionIds = [];
            for (const item of comprehension) {
                if (!item || Object.keys(item).length === 0) {
                    continue;
                }
                const questionOptions = await createOrUpdateQuestionOptions(item.options);
                const questionData = {
                    comprehensionId,
                    complexityId: item.complexityId,
                    subjectId: item.subjectId,
                    gradeId: item.gradeId,
                    examTypeId: item.examTypeId,
                    questionOptions,
                    questionText: item.questionText,
                    questionType: item.questionType,
                    topic: item.topic,
                    subTopic: item.subTopic,
                    hasImage: item.hasImage,
                    qualityChecked: item.qualityChecked,
                    answerFeedback: item.answerFeedback,
                    explanation: item.explanation,
                    status: item.status,
                    userId: userId,
                    createdBy: userId.role,
                    ownership: userId.role
                };
                const savedQuestion = await new Question(questionData).save();
                questionIds.push(savedQuestion._id);
            }
            return questionIds;
        };

        const updateTestModel = async (testId, comprehensionId, questionId) => {
            if (!testId) return;
            const updateField = comprehensionId ? { comprehensions: comprehensionId, questionOrder: comprehensionId } : { questions: questionId, questionOrder: questionId };
            await Test.findByIdAndUpdate(testId, { $addToSet: updateField });
        };

        if (comprehension && comprehension.length > 0) {
            const comprehensionData = {
                paragraph: req.body.paragraph,
                topic: req.body.topic,
                subTopic: req.body.subTopic,
                subjectId: req.body.subjectId,
                gradeId: req.body.gradeId,
                examTypeId: req.body.examTypeId,
                complexityId: req.body.complexityId,
                hasImage: req.body.hasImage,
                qualityChecked: req.body.qualityChecked,
                totalQuestions: req.body.totalQuestions,
                userId: userId,
                createdBy: userId.role,
                ownership: userId.role
            };

            const newComprehension = await updateOrCreateComprehension(comprehensionData);
            const questionIds = await processComprehensionQuestions(comprehension, newComprehension._id);

            await Comprehension.findByIdAndUpdate(newComprehension._id, { $set: { questionId: questionIds } });
            await updateTestModel(testId, newComprehension._id);

            return res.status(201).json(newComprehension);
        }

        if (optionData) {
            const questionOptions = await createOrUpdateQuestionOptions(optionData);
            const questionData = {
                comprehensionId: req.body.comprehensionId,
                complexityId: req.body.complexityId,
                subjectId: req.body.subjectId,
                gradeId: req.body.gradeId,
                examTypeId: req.body.examTypeId,
                questionOptions,
                questionText: req.body.question,
                questionType: req.body.questionType,
                topic: req.body.topic,
                subTopic: req.body.subTopic,
                hasImage: req.body.hasImage,
                qualityChecked: req.body.qualityChecked,
                answerFeedback: req.body.answerFeedback,
                explanation: req.body.explanation,
                status: req.body.status,
                userId: userId,
                createdBy: userId.role,
                ownership: userId.role
            };

            if (questionId) {
                const updatedQuestion = await Question.findByIdAndUpdate(questionId, { $set: questionData }, { new: true });
                if (req.body.comprehensionId) {
                    await Comprehension.findByIdAndUpdate(req.body.comprehensionId, { $addToSet: { questionId: updatedQuestion._id } });
                }
                await updateTestModel(testId, null, updatedQuestion._id);
                return res.status(200).json(updatedQuestion);
            }

            const savedQuestion = await new Question(questionData).save();
            if (req.body.comprehensionId) {
                await Comprehension.findByIdAndUpdate(req.body.comprehensionId, { $addToSet: { questionId: savedQuestion._id } });
            }
            await updateTestModel(testId, null, savedQuestion._id);

            return res.status(201).json(savedQuestion);
        }

        return res.status(400).json({ message: 'No valid question options provided' });
    } catch (error) {
        console.error('Error creating or updating question:', error);
        return res.status(400).json({ message: 'Failed to create or update question', error: error.message });
    }
};

// eslint-disable-next-line sonarjs/cognitive-complexity
const getAllQuestions = async (req, res) => {
    try {
        const { page = 1, limit = 10, questionType = '', filterQuery = {}, testId, topic, subtopic, isRandom = false } = req.query;
        const { role, userId } = req.user;

        let pageInt = parseInt(page, 10);
        let limitInt = parseInt(limit, 10);

        if (isNaN(pageInt) || pageInt < 1) pageInt = 1;
        if (isNaN(limitInt) || limitInt < 1) limitInt = 10;

        let query = {
            status: 'active'
        };

        if (role === 'operator') {
            query.createdBy = role;
            query.ownership = role;
            query.userId = userId;
        }

        if (topic) {
            query.topicSlug = topic;
        }

        if (subtopic) {
            query.subTopicSlug = subtopic;
        }

        if (testId) {
            const test = await Test.findById(testId)
                .populate({
                    path: 'packageName',
                    populate: 'tests'
                })
                .select('questionOrder packageName');

            const existingQuestionIds = test.packageName.tests.flatMap((item) => item.questionOrder);

            query._id = { $nin: existingQuestionIds };
        }

        if (filterQuery.role) {
            query.ownership = filterQuery.role;
        }

        if (filterQuery.qualityChecked) {
            query.qualityChecked = filterQuery.qualityChecked;
        }

        if (filterQuery.topic) {
            query.topic = filterQuery.topic;
        }

        if (filterQuery.subTopic) {
            query.subTopic = filterQuery.subTopic;
        }

        if (filterQuery.complexityId) {
            query.complexityId = filterQuery.complexityId;
        }

        if (filterQuery.subjectId) {
            query.subjectId = filterQuery.subjectId;
        }

        if (filterQuery.gradeId) {
            query.gradeId = filterQuery.gradeId;
        }

        if (filterQuery.examTypeId) {
            query.examTypeId = filterQuery.examTypeId;
        }

        if (filterQuery.hasImage) {
            query.hasImage = filterQuery.hasImage;
        }

        if (questionType !== '') {
            query.questionType = questionType;
        } else {
            query.questionType = { $ne: 'comprehension' };
        }

        if (questionType !== 'comprehension') {
            query.comprehensionId = null;
        }

        let questions;

        if (filterQuery.addedFrom && !isNaN(Date.parse(filterQuery.addedFrom))) {
            query.createdAt = { $gte: new Date(filterQuery.addedFrom) };
        }

        if (filterQuery.addedTo && !isNaN(Date.parse(filterQuery.addedTo))) {
            const addedToDate = new Date(filterQuery.addedTo);
            addedToDate.setHours(23, 59, 59, 999); // Set the time to the end of the day
            if (!query.createdAt) {
                query.createdAt = {};
            }
            query.createdAt.$lte = addedToDate;
        }

        if (filterQuery._id) {
            if (mongoose.Types.ObjectId.isValid(filterQuery._id)) {
                query = { _id: filterQuery._id };
            } else {
                return res.status(200).json({
                    questions,
                    currentPage: 0,
                    totalPages: 0,
                    totalQuestions: 0
                });
            }
        }

        if (questionType === 'comprehension') {
            questions = await Comprehension
                .find({ ...filterQuery, status: 'active' })
                .populate('subjectId gradeId examTypeId complexityId')
                .populate({
                    path: 'questionId',
                    populate: {
                        path: 'complexityId subjectId gradeId examTypeId questionOptions'
                    },
                    options: { limit: limitInt }
                })
                .skip((pageInt - 1) * limitInt)
                .limit(limitInt)
                .sort({ createdAt: -1 });
        } else {
            if (!isRandom) {
                questions = await Question
                    .find(query)
                    .populate('comprehensionId complexityId subjectId gradeId examTypeId questionOptions')
                    .skip((pageInt - 1) * limitInt)
                    .limit(limitInt)
                    .sort({ createdAt: -1 });
            } else {
                questions = await Question.aggregate([
                    { $match: query },
                    { $sample: { size: limitInt } },
                    {
                        $lookup: {
                            from: "comprehensions",
                            localField: "comprehensionId",
                            foreignField: "_id",
                            as: "comprehensionId"
                        }
                    },
                    {
                        $lookup: {
                            from: "complexities",
                            localField: "complexityId",
                            foreignField: "_id",
                            as: "complexityId"
                        }
                    },
                    {
                        $lookup: {
                            from: "subjects",
                            localField: "subjectId",
                            foreignField: "_id",
                            as: "subjectId"
                        }
                    },
                    {
                        $lookup: {
                            from: "grades",
                            localField: "gradeId",
                            foreignField: "_id",
                            as: "gradeId"
                        }
                    },
                    {
                        $lookup: {
                            from: "examtypes",
                            localField: "examTypeId",
                            foreignField: "_id",
                            as: "examTypeId"
                        }
                    },
                    {
                        $lookup: {
                            from: "questionoptions",
                            localField: "questionOptions",
                            foreignField: "_id",
                            as: "questionOptions"
                        }
                    }
                ]);
            }
        }

        const totalQuestions = await (questionType === 'comprehension'
            ? Comprehension.countDocuments({})
            : Question.find(query).countDocuments({})
        );

        res.status(200).json({
            limit,
            questions,
            currentPage: pageInt,
            totalPages: Math.ceil(totalQuestions / limitInt),
            totalQuestions
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve questions', error: error.message });
    }
};

const exportQuestion = async (req, res) => {
    try {
        const { page = 1, limit = 10, questionType = '', filterQuery = {} } = req.query;
        let pageInt = parseInt(page, 10);
        let limitInt = parseInt(limit, 10);

        if (isNaN(pageInt) || pageInt < 1) pageInt = 1;
        if (isNaN(limitInt) || limitInt < 1) limitInt = 10;

        const query = {
            status: 'active'
        };

        if (filterQuery.topic) {
            query.topic = { $regex: filterQuery.topic, $options: 'i' };
        }

        if (filterQuery.subtopic) {
            query.subtopic = { $regex: filterQuery.subtopic, $options: 'i' };
        }

        if (filterQuery.complexityId) {
            query.complexityId = filterQuery.complexityId;
        }

        if (filterQuery.subjectId) {
            query.subjectId = filterQuery.subjectId;
        }

        if (filterQuery.gradeId) {
            query.gradeId = filterQuery.gradeId;
        }

        if (filterQuery.examTypeId) {
            query.examTypeId = filterQuery.examTypeId;
        }

        if (filterQuery._id) {
            query._id = filterQuery._id;
        }

        if (questionType !== '') {
            query.questionType = questionType;
        } else {
            query.questionType = { $ne: 'comprehension' };
        }

        if (questionType !== 'comprehension') {
            query.comprehensionId = null;
        }

        let questions;

        if (questionType === 'comprehension') {
            questions = await Comprehension.find({ ...filterQuery, status: 'active' })
                .populate('subjectId gradeId examTypeId complexityId')
                .populate({
                    path: 'questionId',
                    populate: {
                        path: 'complexityId subjectId gradeId examTypeId questionOptions',
                    }
                })
                .skip((pageInt - 1) * limitInt)
                .limit(limitInt)
                .sort({ createdAt: -1 });
        } else {
            questions = await Question.find(query)
                .populate('comprehensionId complexityId subjectId gradeId examTypeId questionOptions')
                .skip((pageInt - 1) * limitInt)
                .limit(limitInt)
                .sort({ createdAt: -1 });
        }

        const totalQuestions = await (questionType === 'comprehension'
            ? Comprehension.countDocuments({})
            : Question.find(query).countDocuments({})
        );

        res.status(200).json({
            questions,
            currentPage: pageInt,
            totalPages: Math.ceil(totalQuestions / limitInt),
            totalQuestions
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve questions', error: error.message });
    }
};

const getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        let question;

        question = await Question
            .findById(id)
            .populate('questionOptions');

        let questionType;

        if (!question) {
            question = await Comprehension.findById(id)
                .populate({
                    path: 'questionId',
                    populate: {
                        path: 'questionOptions',
                    }
                });
            questionType = 'comprehension';
        } else {
            questionType = question.questionType;
        }

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json({ question, questionType });
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve question', error: error.message });
    }
};

const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedQuestion = await Question.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }
        res.status(200).json(updatedQuestion);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update question', error: error.message });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        let question = await Question.findById(id);
        if (question) {
            const tests = await Test.find({ questions: id });

            if (tests.length > 0) {
                return res.status(400).json({ message: 'Question cannot be deleted because it is associated with a test.' });
            }

            const updatedStatus = question.status === 'deleted' ? 'active' : 'deleted';

            const updatedQuestion = await Question.findByIdAndUpdate(
                id,
                { status: updatedStatus },
                { new: true }
            ).populate('comprehensionId complexityId subjectId gradeId examTypeId questionOptions userId');

            return res.status(200).json({
                message: `Question status updated to ${updatedStatus}`,
                updatedQuestion
            });
        }

        let comprehension = await Comprehension.findById(id);
        if (comprehension) {
            const tests = await Test.find({ comprehensions: id });

            if (tests.length > 0) {
                return res.status(400).json({ message: 'Comprehension cannot be deleted because it is associated with a test.' });
            }

            const updatedComprehensionStatus = comprehension.status === 'deleted' ? 'active' : 'deleted';

            const updatedComprehension = await Comprehension.findByIdAndUpdate(
                id,
                { status: updatedComprehensionStatus },
                { new: true }
            );

            return res.status(200).json({
                message: `Comprehension status updated to ${updatedComprehensionStatus}`,
                updatedQuestion: updatedComprehension,

            });
        }

        return res.status(404).json({ message: 'Neither Question nor Comprehension found' });

    } catch (error) {
        console.error('Error toggling delete status:', error);
        res.status(500).json({ message: 'Failed to toggle delete status', error: error.message });
    }
};

const archiveQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        const question = await Question.findById(id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const updatedArchiveStatus = !question.isArchived;

        const updatedQuestion = await Question.findByIdAndUpdate(
            id,
            { isArchived: updatedArchiveStatus },
            { new: true }
        ).populate('comprehensionId complexityId subjectId gradeId examTypeId questionOptions userId');

        res.status(200).json({
            message: `Question archive status updated to ${updatedArchiveStatus}`,
            updatedQuestion
        });
    } catch (error) {
        console.error('Error toggling archive status:', error);
        res.status(500).json({ message: 'Failed to toggle archive status', error: error.message });
    }
};

const duplicateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const originalQuestion = await Question.findById(id);

        if (!originalQuestion) {
            return res.status(404).json({ message: 'Question not found' });
        }

        const duplicatedQuestion = new Question({
            ...originalQuestion.toObject(),
            _id: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const savedQuestion = await duplicatedQuestion.save();

        res.status(201).json({
            message: 'Question duplicated successfully',
            duplicatedQuestion: savedQuestion
        });
    } catch (error) {
        console.error('Error duplicating question:', error);
        res.status(500).json({ message: 'Failed to duplicate question', error: error.message });
    }
};

const importExcel = async (req, res) => {
    try {
        const upload = createUpload('excel');
        upload.single('file')(req, res, async (err) => {
            res.status(200).json({ message: 'Excel import successful' });
            if (err) {
                errorLogger('Error uploading file:', err);
                return res.status(500).json({ message: 'Error uploading file', status: false });
            }
        })
    } catch (error) {
        console.error('Error importing Excel:', error);
        res.status(500).json({ message: 'Failed to import Excel', error: error.message });
    }
}

const usedIn = async (req, res) => {
    try {
        const { questionId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(questionId)) {
            return res.status(400).json({
                message: 'Invalid question ID provided.',
            });
        }

        const tests = await Test.find({ questions: questionId });
        const comprehensions = await Test.find({ comprehensions: questionId });

        const data = [...tests, ...comprehensions];

        res.status(200).json({
            success: true,
            message: 'Tests fetched successfully.',
            data: data,
        });
    } catch (error) {
        console.error('Error finding tests with the specified question ID:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching tests.',
            error: error.message,
        });
    }
};

const searchQuestion = async (req, res) => {
    try {
        let { topic, subTopic } = req.query || {};

        const query = {};

        if (topic) {
            topic = topic.trim();
            query.topic = { $regex: topic, $options: 'i' };
        }
        if (subTopic) {
            subTopic = subTopic.trim();
            query.subTopic = { $regex: subTopic, $options: 'i' };
        }

        const questions = await Question.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        topic: { $toLower: "$topic" },
                        subTopic: { $toLower: "$subTopic" },
                    },
                    topic: { $first: "$topic" },
                    subTopic: { $first: "$subTopic" },
                }
            },
            { $project: { _id: 0, topic: 1, subTopic: 1 } },
            { $sort: { topic: 1, subTopic: 1 } },
            {
                $group: {
                    _id: null,
                    uniqueQuestions: { $addToSet: { topic: "$topic", subTopic: "$subTopic" } }
                }
            },
            { $unwind: "$uniqueQuestions" },
            { $replaceRoot: { newRoot: "$uniqueQuestions" } },
        ]);

        let trimmedQuestions;
        if (questions.length > 0) {
            trimmedQuestions = questions
                .filter(({ topic }) => topic && topic.trim() !== '')
                .map(({ topic, subTopic }) => ({
                    topic: topic.trim(),
                    subTopic: subTopic ? subTopic.trim() : '',
                }));
        } else {
            const defaultQuestions = await Question.aggregate([
                {
                    $group: {
                        _id: {
                            topic: { $toLower: "$topic" },
                            subTopic: { $toLower: "$subTopic" },
                        },
                        topic: { $first: "$topic" },
                        subTopic: { $first: "$subTopic" },
                    }
                },
                { $project: { _id: 0, topic: 1, subTopic: 1 } },
                { $sort: { topic: 1, subTopic: 1 } },
                {
                    $group: {
                        _id: null,
                        uniqueQuestions: { $addToSet: { topic: "$topic", subTopic: "$subTopic" } }
                    }
                },
                { $unwind: "$uniqueQuestions" },
                { $replaceRoot: { newRoot: "$uniqueQuestions" } },
                { $limit: 100 },
            ]);

            trimmedQuestions = defaultQuestions
                .filter(({ topic }) => topic && topic.trim() !== '')
                .map(({ topic, subTopic }) => ({
                    topic: topic.trim(),
                    subTopic: subTopic ? subTopic.trim() : '',
                }));
        }

        res.status(200).json({
            success: true,
            message: 'Topics fetched successfully.',
            data: trimmedQuestions,
        });
    } catch (error) {
        console.error('Error finding Topics with the specified question ID:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching Topics.',
            error: error.message,
        });
    }
};

const takeOwnership = catchErrors(async (req, res) => {
    const { id } = req.params;
    const question = await Question.findByIdAndUpdate(id,
        { ownership: 'admin' },
        { new: true }
    )

    if (!question) {
        return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json({
        message: 'Question ownership updated to admin',
        question
    })
})

const takeBulkOwnership = catchErrors(async (req, res) => {
    const { questionIds } = req.body;
    const questions = await Question.updateMany({ _id: { $in: questionIds } },
        { ownership: 'admin' }
    )
    if (questions.nModified === 0) {
        return res.status(404).json({ message: 'Questions not found' });
    }
    res.status(200).json({
        message: `Successfully updated ownership for ${questions.nModified} questions`,
    })
})

const updataQuestionTopic = catchErrors(async (req, res) => {
    try {
        const { type, topic, newTopic, subTopic, newSubtopic } = req.body;

        let updatedQuestion;

        if (type === "topic") {
            updatedQuestion = await Question.updateMany(
                { topic },
                { topic: newTopic },
                { new: true }
            );
        } else if (type === "subTopic") {
            updatedQuestion = await Question.updateMany(
                { subTopic },
                { subTopic: newSubtopic },
                { new: true }
            );
        } else {
            return res.status(400).json({ message: "Invalid type. Use 'topic' or 'subTopic'." });
        }

        if (!updatedQuestion.modifiedCount) {
            return res.status(404).json({ message: `${type} not found` });
        }

        res.status(200).json({ message: `${type} updated successfully`, updatedQuestion });
    } catch (error) {
        res.status(500).json({ message: `Internal server error`, error: error.message });
    }
});


module.exports = {
    createOrUpdateQuestion,
    getAllQuestions,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
    archiveQuestion,
    duplicateQuestion,
    importExcel,
    usedIn,
    searchQuestion,
    exportQuestion,
    takeOwnership,
    takeBulkOwnership, updataQuestionTopic
};
