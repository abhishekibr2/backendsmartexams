const tutorialSchema = require('../../models/tutorialClass');

const tutorialController = {

    getTutorial: async (req, res) => {
        try {
            const getData = await tutorialSchema.find();
            if (!getData || getData.length === 0) {
                return res.status(404).json({ message: 'No tutorials found' });
            }

            res.status(200).json(getData);
        } catch (error) {
            console.error('Error fetching tutorials:', error);
            res.status(500).json({ message: 'Error retrieving tutorials', error: error.message });
        }
    }
};

module.exports = tutorialController;
