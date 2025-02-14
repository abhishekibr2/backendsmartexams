const whyChooseUsModel = require('../../models/whyChooseUs');

const whyChooseUsController = {
    getSectionData: async (req, res) => {
        try {
            const sectionData = await whyChooseUsModel.find();
            return res.status(200).json({ data: sectionData });
        } catch (error) {
            console.error('Error retrieving section data:', error);
            return res.status(500).json({ error: 'Server error' });
        }
    }
}

module.exports = whyChooseUsController;
