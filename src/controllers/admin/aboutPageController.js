const AboutPageModel = require('../../models/AboutpageContent');
const { createUpload } = require('../../utils/multerConfig');


const aboutPageController = {

    getAboutPageContent: async (req, res) => {
        try {
            const aboutPageContent = await AboutPageModel.find().sort({ _id: -1 });

            res.status(200).json({ status: true, data: aboutPageContent });
        } catch (error) {
            console.error('Error in getAboutPageContent:', error);
            res.status(500).json({ status: false, message: 'Internal Server Error' });
        }
    },

    addFrontendAboutPageContent: async (req, res) => {
        const upload = createUpload('aboutPageImages');

        upload.fields([
            { name: 'image', maxCount: 1 },
            { name: 'imageCardOne', maxCount: 1 },
            { name: 'imageCardTwo', maxCount: 1 },
            { name: 'imageCardThree', maxCount: 1 },
        ])(req, res, async (err) => {
            if (err) {
                console.error('Upload error:', err);
                return res.status(500).json({ message: 'Error uploading files', status: false });
            }

            try {
                const {
                    headingOne, descriptionOne, editId, buttonText,
                    headingTwo, descriptionTwo,
                    headingThree, descriptionThree, descriptionFour,
                    headingCardOne, descriptionCardOne, headingCardTwo, descriptionCardTwo, headingCardThree, descriptionCardThree,
                } = req.body;

                // Handle images
                const image = req.files && req.files['image'] ? req.files['image'][0].filename : null;
                const imageCardOne = req.files && req.files['imageCardOne'] ? req.files['imageCardOne'][0].filename : null;
                const imageCardTwo = req.files && req.files['imageCardTwo'] ? req.files['imageCardTwo'][0].filename : null;
                const imageCardThree = req.files && req.files['imageCardThree'] ? req.files['imageCardThree'][0].filename : null;

                // Prepare about page data
                const aboutPageData = {
                    headingOne, descriptionOne, buttonText,
                    headingTwo, descriptionTwo,
                    headingThree, descriptionThree, descriptionFour,
                    headingCardOne, descriptionCardOne, headingCardTwo, descriptionCardTwo, headingCardThree, descriptionCardThree,
                };

                // Only add images if they are present in the request
                if (image) aboutPageData.image = image;
                if (imageCardOne) aboutPageData.imageCardOne = imageCardOne;
                if (imageCardTwo) aboutPageData.imageCardTwo = imageCardTwo;
                if (imageCardThree) aboutPageData.imageCardThree = imageCardThree;

                let data;

                if (editId) {
                    // Update existing AboutPage content
                    data = await AboutPageModel.findByIdAndUpdate(editId, aboutPageData, { new: true });

                    if (!data) {
                        return res.status(404).json({ message: 'AboutPage content not found for the provided ID', status: false });
                    }

                    return res.status(200).json({
                        status: true,
                        message: 'AboutPage Content updated successfully',
                        data,
                    });
                } else {
                    // Create new AboutPage content
                    data = await AboutPageModel.create(aboutPageData);
                    return res.status(201).json({
                        status: true,
                        message: 'AboutPage Content added successfully',
                        data,
                    });
                }
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: error.message || 'Unexpected error', status: false });
            }
        });
    },


}
module.exports = aboutPageController
