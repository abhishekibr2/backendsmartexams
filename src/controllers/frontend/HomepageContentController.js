const homePageModel = require('../../models/HomepageContent');


const HomepageContentController = {
    getHomePageContent: async (req, res) => {
        try {
            const homePageContent = await homePageModel.findOne().sort({ _id: -1 });

            res.status(200).json({ status: true, data: homePageContent });
        } catch (error) {
            console.error('Error in getHomePageContent:', error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },
};

module.exports = HomepageContentController;
