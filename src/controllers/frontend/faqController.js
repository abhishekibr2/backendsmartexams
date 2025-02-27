const faqModel = require('../../models/faqModel');

const faqController = {
    getFaqs: async (req, res) => {
        try {
            const faqs = await faqModel.find({ pages: 'Home' }).sort(({ orderBy: 1 }));
            res.status(200).json({ data: faqs });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getFaqStateWithExamTypes: async (req, res) => {
        const { stateId, examId } = req.params;
        try {
            const faqs = await faqModel.find({ stateId: stateId, examTypeId: examId, pages: { $ne: 'home' } })
                .sort({ orderBy: 1 });
            if (!faqs || faqs.length === 0) {
                return res.status(200).json({ status: false, message: 'No FAQs found for the given state and exam type' });
            }
            res.status(200).json({ status: true, data: faqs });
        } catch (error) {
            res.status(500).json({ status: false, message: 'Error fetching FAQs', error: error.message });
        }
    },

}

module.exports = faqController;
