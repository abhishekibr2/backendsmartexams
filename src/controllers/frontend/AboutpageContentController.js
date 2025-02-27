const AboutpageContent = require('../../models/AboutpageContent');


const AboutpageContentController = {
    getAboutPageContent: async (req, res) => {
        try {
            const aboutPageContent = await AboutpageContent.findOne().sort({ _id: -1 });

            res.status(200).json({ status: true, data: aboutPageContent });
        } catch (error) {
            console.error('Error in getAboutPageContent:', error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },
};

module.exports = AboutpageContentController;
