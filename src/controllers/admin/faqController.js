const faqModel = require("../../models/faqModel");
const faqController = {
    AddQuestions: async (req, res) => {
        try {
            const { userId, questions, answer, pages, stateId, examTypeId, updateId, orderBy } = req.body.data;
            let updatedState = stateId;
            let updatedExamType = examTypeId;

            if (pages === 'home') {
                updatedState = null;
                updatedExamType = null;
            }

            if (updateId) {
                const updatedData = await faqModel.findByIdAndUpdate(
                    updateId,
                    { userId, questions, answer, pages, stateId: updatedState, orderBy, examTypeId: updatedExamType },
                    { new: true }
                );

                if (!updatedData) {
                    return res.status(404).json({ message: 'FAQ not found' });
                }

                return res.status(200).json({
                    status: true,
                    data: updatedData,
                    message: 'Question Updated Successfully',
                });
            } else {
                const newFAQ = new faqModel({
                    userId,
                    questions,
                    answer,
                    pages,
                    stateId: updatedState,
                    examTypeId: updatedExamType,
                    orderBy
                });

                const savedFAQ = await newFAQ.save();

                return res.status(200).json({
                    status: true,
                    data: savedFAQ,
                    message: 'Question Added Successfully',
                });
            }
        } catch (error) {
            console.error('Error:', error);
            return res.status(500).json({
                status: false,
                message: 'An error occurred while adding or updating the question',
            });
        }
    },



    getFaqData: async (req, res) => {
        try {
            const response = await faqModel.find()
                .populate('stateId', 'title')
                .populate('examTypeId', 'examType')
                .sort({ createdAt: -1 });

            if (!response || response.length === 0) {
                return res.status(404).json({ status: false, message: 'No FAQs found' });
            }
            return res.status(200).json({ status: true, data: response, message: 'FAQ fetched successfully' });

        } catch (error) {
            console.log(error, 'error')
            return res.status(500).json({
                status: false,
                message: 'An error occurred while fetching FAQs',
            });
        }
    },



    deleteFaq: async (req, res) => {
        try {
            const { id } = req.body.data;
            if (!id) {
                return res.status(400).json({ message: 'id is required' });
            }
            const response = await faqModel.deleteMany({ _id: { $in: id } });
            if (response.deletedCount === 0) {
                return res.status(404).json({ status: false, message: 'No FAQs found for the given IDs' });
            }

            return res.status(200).json({ status: true, data: response, message: 'Faq(s) deleted successfully' });

        } catch (error) {

            return res.status(500).json({
                status: false,
                message: 'An error occurred while deleting the faq(s)',
            });
        }
    }

}


module.exports = faqController
