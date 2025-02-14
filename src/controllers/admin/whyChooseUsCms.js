const whyChooseUsModel = require('../../models/whyChooseUs');
const { createUpload } = require('../../utils/multerConfig');

const whyChooseUsController = {
    addSectionOne: async (req, res) => {

        const upload = createUpload('WhyChoseUsIcons');

        upload.fields([
            { name: 'IconOne', maxCount: 1 },
            { name: 'IconTwo', maxCount: 1 },
            { name: 'IconThree', maxCount: 1 },
            { name: 'IconFour', maxCount: 1 },
        ])(req, res, async (err) => {
            if (err) {
                console.log('Error file:', err);
                console.log(err, 'error');
                return res.status(400).json({ message: 'File upload error', status: false, error: err });
            }

            try {
                const {
                    heading,
                    titleOne,
                    descriptionOne,
                    titleTwo,
                    descriptionTwo,
                    titleThree,
                    descriptionThree,
                    titleFour,
                    descriptionFour,
                    achievementsHeading,
                    countOne,
                    countOneDesc,
                    countTwo,
                    countTwoDesc,
                    countThree,
                    countThreeDesc,
                    countFour,
                    countFourDesc,
                    numberOneCore,
                    descriptionCore,
                    numberTwoCore,
                    descriptionTwoCore,
                    numberThreeCore,
                    descriptionThreeCore,
                    numberFourCore,
                    descriptionFourCore,
                    numberFiveCore,
                    descriptionFiVeCore,
                    numberSixCore,
                    descriptionSixCore,
                    updateId,
                    coreHeading,
                } = req.body;

                const IconOne = req.files && req.files.IconOne ? req.files.IconOne[0].filename : req.body.IconOne;
                const IconTwo = req.files && req.files.IconTwo ? req.files.IconTwo[0].filename : req.body.IconTwo;
                const IconThree = req.files && req.files.IconThree ? req.files.IconThree[0].filename : req.body.IconThree;
                const IconFour = req.files && req.files.IconFour ? req.files.IconFour[0].filename : req.body.IconFour;

                const sectionData = {
                    heading,
                    titleOne,
                    descriptionOne,
                    titleTwo,
                    descriptionTwo,
                    titleThree,
                    descriptionThree,
                    titleFour,
                    descriptionFour,
                    achievementsHeading,
                    countOne,
                    countOneDesc,
                    countTwo,
                    countTwoDesc,
                    countThree,
                    countThreeDesc,
                    countFour,
                    countFourDesc,
                    numberOneCore,
                    descriptionCore,
                    numberTwoCore,
                    descriptionTwoCore,
                    numberThreeCore,
                    descriptionThreeCore,
                    numberFourCore,
                    descriptionFourCore,
                    numberFiveCore,
                    descriptionFiVeCore,
                    numberSixCore,
                    descriptionSixCore,
                    coreHeading,
                    IconOne,
                    IconTwo,
                    IconThree,
                    IconFour
                };

                if (updateId) {
                    const updatedSection = await whyChooseUsModel.findByIdAndUpdate(
                        updateId,
                        sectionData,
                        { new: true }
                    );

                    if (!updatedSection) {
                        return res.status(404).json({ message: 'Section not found' });
                    }

                    return res.status(200).json({
                        message: 'Why Choose Us updated successfully',
                        data: updatedSection
                    });
                }

                const newSection = new whyChooseUsModel(sectionData);
                await newSection.save();

                return res.status(201).json({
                    message: 'Section added successfully',
                    data: newSection
                });
            } catch (error) {
                console.log('Error adding/updating section:', error);
                return res.status(500).json({ error: 'Server error' });
            }
        });
    },

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
